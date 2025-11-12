const Role = require('../models/mysql/role.model');
const Permission = require('../models/mysql/permission.model');
const { logger } = require('../utils/logger');

const loadPermissions = async (req, res, next) => {
    try {
        // 🧩 Verificar usuario autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // ⚙️ Obtener roles del usuario (del JWT)
        const userRoles = req.user.roles || [];

        if (!Array.isArray(userRoles) || userRoles.length === 0) {
            req.user.permissions = {};
            return next();
        }

        // 🔹 Cargar permisos de todos los roles del usuario
        const roles = await Role.findAll({
            where: { name: userRoles },
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

        // ✅ Asignar permisos consolidados al request
        req.user.permissions = mergedPermissions;

        next();
    } catch (err) {
        logger.error(`Error al cargar permisos dinámicamente: ${err.message}`);
        return res.status(500).json({ message: 'Error al cargar permisos' });
    }
};

module.exports = loadPermissions;
