const sequelize = require('../../config/database');
const permissionRepository = require('./permission.repository');
const Role = require('../../models/mysql/role.model');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper'); // ✅ agregado

class PermissionService {
    // 🔹 Obtener permisos por rol
    async getByRole(roleId, currentUser, req) {
        try {
            const role = await Role.findOne({
                where: { id: roleId, tenant_id: currentUser.tenant_id }
            });
            if (!role)
                throw new Error('Rol no encontrado o no pertenece al tenant actual');

            const permissions = await permissionRepository.findAllByRole(roleId);

            return permissions.map(p => ({
                id: p.id,
                module: p.module,
                read: p.can_read,
                write: p.can_write,
                edit: p.can_edit,
                delete: p.can_delete
            }));
        } catch (err) {
            logger.error(`Error en getByRole Permissions: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔹 Actualizar permisos por rol
    async updateByRole(roleId, newPermissions, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (!Array.isArray(newPermissions)) {
                throw new Error('El cuerpo debe ser un arreglo de permisos');
            }

            const role = await Role.findOne({
                where: { id: roleId, tenant_id: currentUser.tenant_id },
                transaction: t
            });
            if (!role) {
                await t.rollback();
                throw new Error('Rol no encontrado o no pertenece al tenant actual');
            }

            // Validar módulos válidos
            const tenantModules = await permissionRepository.findModulesByTenant(
                currentUser.tenant_id,
                t
            );
            const validModules = tenantModules.map(m => m.module);

            for (const p of newPermissions) {
                if (!validModules.includes(p.module)) {
                    await t.rollback();
                    throw new Error(`Módulo inválido: ${p.module}`);
                }
            }

            // Reemplazar permisos
            await permissionRepository.deleteByRole(roleId, t);
            await permissionRepository.bulkCreate(
                newPermissions.map(p => ({
                    role_id: roleId,
                    module: p.module,
                    can_read: !!p.read,
                    can_write: !!p.write,
                    can_edit: !!p.edit,
                    can_delete: !!p.delete
                })),
                t
            );

            await t.commit();

            // 🧾 Log de seguridad
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'permissions',
                description: `Permisos actualizados para el rol "${role.name}" (ID ${roleId})`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Permisos actualizados',
                message: `${currentUser.username} modificó los permisos del rol "${role.name}".`,
                type: 'system'
            });

            return { message: 'Permisos actualizados correctamente' };
        } catch (err) {
            await t.rollback();
            logger.error(`Error en updateByRole Permissions: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new PermissionService();
