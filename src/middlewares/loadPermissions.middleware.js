const Role = require('../models/mysql/role.model');
const Permission = require('../models/mysql/permission.model');
const { logger } = require('../utils/logger');
const permissionsCache = require('../utils/permissions.cache');

const loadPermissions = async (req, res, next) => {
    try {
        // 🧩 Verificar usuario autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // ⚙️ Obtener roles del usuario (del JWT)
        const userRoleIds = req.user.role_ids;
        const userRoles = req.user.roles || [];

        // Validar si hay roles (IDs o Nombres)
        const hasIds = Array.isArray(userRoleIds) && userRoleIds.length > 0;
        const hasNames = Array.isArray(userRoles) && userRoles.length > 0;

        if (!hasIds && !hasNames) {
            req.user.permissions = {};
            return next();
        }

        // ⚡ CACHE CHECK
        const tenantId = req.user.tenant_id;
        // Usa IDs si existen (más robusto), sino usa nombres (legacy)
        const cacheKey = permissionsCache.generateKey(tenantId, hasIds ? userRoleIds : userRoles);
        const cachedPermissions = permissionsCache.get(cacheKey);

        if (cachedPermissions) {
            req.user.permissions = cachedPermissions;
            return next();
        }

        // 🔹 Cargar permisos de todos los roles del usuario
        // Preferir búsqueda por ID si está disponible
        const queryWhere = hasIds ? { id: userRoleIds } : { name: userRoles };

        const roles = await Role.findAll({
            where: queryWhere,
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['module', 'can_read', 'can_write', 'can_edit', 'can_delete']
                }
            ]
        });

        // 🧠 Fusionar permisos de todos los roles
        const mergedPermissions = {};

        for (const role of roles) {
            // Filtrar roles que no sean del tenant (seguridad adicional)
            if (role.tenant_id && role.tenant_id !== tenantId) continue;

            for (const p of role.permissions) {
                if (!mergedPermissions[p.module]) {
                    mergedPermissions[p.module] = {
                        read: p.can_read,
                        write: p.can_write,
                        edit: p.can_edit,
                        delete: p.can_delete
                    };
                } else {
                    mergedPermissions[p.module].read ||= p.can_read;
                    mergedPermissions[p.module].write ||= p.can_write;
                    mergedPermissions[p.module].edit ||= p.can_edit;
                    mergedPermissions[p.module].delete ||= p.can_delete;
                }
            }
        }

        // ⚡ CACHE SET
        permissionsCache.set(cacheKey, mergedPermissions);

        // ✅ Asignar permisos consolidados al request
        req.user.permissions = mergedPermissions;

        next();
    } catch (err) {
        logger.error(`Error al cargar permisos dinámicamente: ${err.message}`);
        return res.status(500).json({ message: 'Error al cargar permisos' });
    }
};

module.exports = loadPermissions;
