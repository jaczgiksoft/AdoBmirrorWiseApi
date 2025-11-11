const express = require('express');
const router = express.Router();

const roleController = require('./role.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { createRoleValidator, updateRoleValidator, getRoleByIdValidator } = require('./role.validator');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =====================
// ROLES ROUTES
// =====================
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'roles'),
    roleController.getAll
);

router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'roles'),
    getRoleByIdValidator,
    validateRequest,
    roleController.getOne
);

router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'roles'),
    roleController.getDatatable
);

router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'roles'),
    createRoleValidator,
    validateRequest,
    roleController.create
);

router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'roles'),
    updateRoleValidator,
    validateRequest,
    roleController.update
);

router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'roles'),
    getRoleByIdValidator,
    validateRequest,
    roleController.softDelete
);

module.exports = router;
