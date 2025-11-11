const express = require('express');
const router = express.Router();

const permissionController = require('./permission.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { updatePermissionsValidator, roleIdParamValidator } = require('./permission.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// 🔒 Requiere autenticación para todo
router.use(validateToken);

// Obtener permisos de un rol
router.get(
    '/:role_id',
    loadPermissions,
    checkPermissions('read', 'permissions'),
    roleIdParamValidator,
    validateRequest,
    permissionController.getByRole
);

// Actualizar permisos de un rol
router.put(
    '/:role_id',
    loadPermissions,
    checkPermissions('edit', 'permissions'),
    roleIdParamValidator,
    updatePermissionsValidator,
    validateRequest,
    permissionController.updateByRole
);

module.exports = router;
