const sequelize = require('../../config/database');
const roleRepository = require('./role.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');
const permissionsCache = require('../../utils/permissions.cache');

class RoleService {
    async getAllRoles(currentUser) {
        const roles = await roleRepository.findAllByTenant(currentUser.tenant_id);
        return roles.map(r => r.toJSON());
    }

    async getRoleById(id, currentUser) {
        const role = await roleRepository.findById(id, currentUser.tenant_id);
        if (!role) throw new Error('Rol no encontrado');
        return role.toJSON();
    }

    // 🟢 Crear rol
    async createRole(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const { name, requires_cash_session = false } = data;

            if (!name) throw new Error('El nombre es obligatorio');
            if (await roleRepository.findByName(name, currentUser.tenant_id)) {
                throw new Error('Ya existe un rol con ese nombre');
            }

            const newRole = await roleRepository.createRole(
                {
                    name,
                    tenant_id: currentUser.tenant_id,
                    requires_cash_session // ✅ nuevo campo
                },
                t
            );

            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'roles',
                description: `Rol creado: ${newRole.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nuevo rol creado',
                message: `${currentUser.username} ha creado el rol "${newRole.name}".`,
                type: 'system'
            });

            return newRole.toJSON();
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear rol: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar rol
    async updateRole(id, data, currentUser, req) {
        const role = await roleRepository.findById(id, currentUser.tenant_id);
        if (!role) throw new Error('Rol no encontrado');

        if (data.name && data.name !== role.name) {
            if (await roleRepository.findByName(data.name, currentUser.tenant_id)) {
                throw new Error('Ya existe un rol con ese nombre');
            }
        }

        // 🧩 Asegurar que el booleano se actualiza correctamente
        const updateData = {
            ...data,
        };

        if (typeof data.requires_cash_session !== 'undefined') {
            updateData.requires_cash_session = !!data.requires_cash_session;
        }

        await roleRepository.updateRole(role, updateData);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'roles',
            description: `Rol actualizado: ${role.name}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Rol actualizado',
            message: `${currentUser.username} ha actualizado el rol "${role.name}".`,
            type: 'system'
        });

        // 🧹 Invalidad cache
        permissionsCache.invalidateByTenant(currentUser.tenant_id);

        return role.toJSON();
    }

    // 🔴 Eliminar rol
    async deleteRole(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const role = await roleRepository.findById(id, currentUser.tenant_id);
            if (!role) throw new Error('Rol no encontrado');

            await roleRepository.softDeleteRole(role, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'roles',
                description: `Rol eliminado: ${role.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Rol eliminado',
                message: `${currentUser.username} ha eliminado el rol "${role.name}".`,
                type: 'system'
            });

            // 🧹 Invalidad cache
            permissionsCache.invalidateByTenant(currentUser.tenant_id);

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar rol: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getRolesDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir };

        const { recordsTotal, recordsFiltered, rows } =
            await roleRepository.datatable(params, currentUser.tenant_id);

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data: rows.map(r => r.toJSON())
        };
    }
}

module.exports = new RoleService();
