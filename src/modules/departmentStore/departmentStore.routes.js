// src/modules/departmentStore/departmentStore.routes.js
const express = require('express');
const router = express.Router();

const departmentStoreController = require('./departmentStore.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    setOverrideValidator,
    deleteOverrideValidator,
} = require('./departmentStore.validator');

// 📌 Obtener overrides por tienda
router.get(
    '/store/:storeId',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'departments'),
    departmentStoreController.getByStore
);

// 📌 Crear o actualizar override
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'departments'),
    setOverrideValidator,
    validateRequest,
    departmentStoreController.setOverride
);

// 📌 Eliminar override (restaurar herencia)
router.delete(
    '/:departmentId/:storeId',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'departments'),
    deleteOverrideValidator,
    validateRequest,
    departmentStoreController.deleteOverride
);

module.exports = router;
