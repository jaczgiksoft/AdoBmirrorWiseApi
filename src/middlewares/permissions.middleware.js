const { logger } = require('../utils/logger');

const checkPermissions = (requiredPermission, explicitModule = null) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            logger.warn(`Permisos: usuario no autenticado. Ruta: ${req.originalUrl}, IP: ${req.ip}`);
            return res.status(401).json({ message: 'No autenticado. Se requiere token' });
        }

        // 👇 Si no se pasa módulo explícito, se infiere de la ruta
        const currentModule = explicitModule || req.baseUrl.replace(/^\/api\/?/, '');

        const modulePermissions = req.user.permissions[currentModule];

        if (modulePermissions && modulePermissions[requiredPermission]) {
            return next();
        }

        logger.warn(
            `Permiso denegado: Usuario ${req.user.id || 'desconocido'} intentó ${requiredPermission} en módulo ${currentModule}. IP: ${req.ip}`
        );

        return res.status(403).json({
            message: `No tienes permiso para ${requiredPermission} en el módulo ${currentModule}`
        });
    };
};

module.exports = { checkPermissions };
