const Permission = require('../models/mysql/permission.model');

const loadPermissions = async (req, res, next) => {
    const { role_id, tenant_id } = req.user;

    try {
        const rawPermissions = await Permission.findAll({
            where: { role_id },
        });

        const permissions = {};
        for (const p of rawPermissions) {
            permissions[p.module] = {
                read: p.can_read,
                write: p.can_write,
                edit: p.can_edit,
                delete: p.can_delete
            };
        }

        req.user.permissions = permissions;
        next();
    } catch (err) {
        console.error('Error al cargar permisos dinámicamente:', err);
        return res.status(500).json({ message: 'Error al cargar permisos' });
    }
};

module.exports = loadPermissions;
