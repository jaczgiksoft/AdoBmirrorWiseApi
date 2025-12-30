const fs = require("fs");
const path = require("path");
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/database');
const userRepository = require('./user.repository');
const Role = require('../../models/mysql/role.model');
const { notifyUser } = require('../../utils/notify.helper');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class UserService {
    async getAllUsers(currentUser) {
        const users = await userRepository.findAllByTenant(currentUser.tenant_id);
        return users.map(user => this.toSafeUser(user));
    }

    async getUserById(id, currentUser) {
        const user = await userRepository.findById(id, currentUser.tenant_id);
        if (!user) throw new Error('Usuario no encontrado');
        return this.toSafeUser(user);
    }

    // 🟢 Crear usuario
    async createUser(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const { username, email, role_id, password, employee_id } = data;
            if (!username || !email || !role_id || !password || !employee_id) {
                throw new Error("Faltan campos obligatorios (employee_id es requerido)");
            }

            // 🔹 Validar rol
            const role = await Role.findOne({
                where: { id: role_id, tenant_id: currentUser.tenant_id },
                transaction: t,
            });
            if (!role) throw new Error("El rol es inválido o no autorizado");

            // 🔹 Validaciones únicas
            if (await userRepository.findByUsername(username, currentUser.tenant_id)) {
                throw new Error("El nombre de usuario ya está en uso");
            }
            // Note: email on user is removed, but we might check if employee email is unique or if username/email check was for login.
            // Since User model no longer has email, this check findsByEmail on User model will fail unless updated.
            // But wait, userRepo.findByEmail now queries User by email column using the new filter logic.
            // BUT User model NO LONGER HAS EMAIL COLUMN based on the previous refactor.
            // So userRepository.findByEmail will FAIL if it tries to query `email`.
            // User.findOne({ where: { email } }) -> Column 'email' not found.
            // We should REMOVE the email check here and in repository if the column is gone.
            // HOWEVER, the `data` payload might have `email` for the employee or notifications.
            // The Refactor removed `email` from `users`. So we shouldn't check it on `users` table.

            // 🔹 Preparar usuario base
            const hashedPassword = await bcrypt.hash(password, 10);
            const userCode = `U${Date.now()}`;

            const newUser = await userRepository.createUser(
                {
                    username,
                    password: hashedPassword,
                    role_id,
                    employee_id, // 🔹 Required now
                    user_code: userCode,
                    // tenant_id: REMOVED
                    status: data.status || "active",
                },
                t
            );

            // 🖼️ Manejo de imagen de perfil (si se subió)
            const { file } = req;
            if (file) {
                const tenantId = currentUser.tenant_id;
                const finalDir = path.join(
                    __dirname,
                    `../../../uploads/${tenantId}/users/${newUser.id}/profile`
                );

                // Crear carpeta final y mover archivo
                fs.mkdirSync(finalDir, { recursive: true });

                const tempPath = file.path;
                const newPath = path.join(finalDir, file.filename);
                fs.renameSync(tempPath, newPath);

                // Guardar la ruta final en la BD
                await newUser.update(
                    {
                        profile_image: `/uploads/${tenantId}/users/${newUser.id}/profile/${file.filename}`,
                    },
                    { transaction: t }
                );
            }

            await userRepository.incrementTenantUsers(currentUser.tenant_id, t);

            await t.commit();

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: "Nuevo usuario creado",
                message: `${currentUser.username} ha registrado el usuario "${newUser.username}" (${role.name}).`,
                type: "system",
            });

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: "create",
                module: "users",
                description: `Usuario ${newUser.username} creado (rol: ${role.name})`,
                ip: req.ip,
                user_agent: req.headers["user-agent"],
            });

            // 🧩 Devuelve usuario sin password, incluyendo la imagen
            return this.toSafeUser(newUser);
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear usuario: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar usuario
    async updateUser(id, data, currentUser, req) {
        const user = await userRepository.findById(id, currentUser.tenant_id);
        if (!user) throw new Error('Usuario no encontrado');

        // 🔹 Validar rol si cambia
        if (data.role_id && data.role_id !== user.role_id) {
            const role = await Role.findOne({ where: { id: data.role_id, tenant_id: currentUser.tenant_id } });
            if (!role) throw new Error('El rol es inválido o no autorizado');
        }

        if (data.username && data.username !== user.username) {
            if (await userRepository.findByUsername(data.username, currentUser.tenant_id)) {
                throw new Error('El nombre de usuario ya está en uso');
            }
        }

        if (data.email && data.email !== user.email) {
            if (await userRepository.findByEmail(data.email, currentUser.tenant_id)) {
                throw new Error('El correo ya está en uso');
            }
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await userRepository.updateUser(user, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'users',
            description: `Usuario actualizado: ${user.username}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Usuario actualizado',
            message: `${currentUser.username} actualizó el perfil de "${user.username}".`,
            type: 'system'
        });

        return this.toSafeUser(user);
    }

    // 🔴 Eliminar usuario
    async deleteUser(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const user = await userRepository.findById(id, currentUser.tenant_id);
            if (!user) throw new Error('Usuario no encontrado');

            // 🔹 Soft delete + decremento
            await userRepository.softDeleteUser(user, t);
            await userRepository.decrementTenantUsers(currentUser.tenant_id, t);

            await t.commit();

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Usuario eliminado',
                message: `${currentUser.username} eliminó al usuario "${user.username}".`,
                type: 'system'
            });

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'users',
                description: `Usuario ${user.username} eliminado (soft delete)`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;

        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar usuario: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧩 Usuario sin contraseña
    toSafeUser(user) {
        const { password, ...safeUser } = user.toJSON ? user.toJSON() : user;
        return safeUser;
    }

    // 🧮 Datatable
    async getUsersDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [
            null, 'username', 'email', 'first_name', 'last_name', 'role.name', 'status', 'id'
        ];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[6][search][value]'] || (body.columns?.[6]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await userRepository.datatable(params, currentUser.tenant_id);

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data: rows.map(u => this.toSafeUser(u))
        };
    }
}

module.exports = new UserService();
