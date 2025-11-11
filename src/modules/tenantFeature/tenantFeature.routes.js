// src/modules/tenantFeature/tenantFeature.routes.js
const express = require('express');
const router = express.Router();

const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

const tenantFeatureController = require('./tenantFeature.controller');
const {
    createTenantFeatureValidator,
    updateTenantFeatureValidator,
    getTenantFeatureByIdValidator
} = require('./tenantFeature.validator');

// =====================
// TENANT FEATURES ROUTES
// =====================

// Listar todas las features del tenant
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'tenant_features'),
    tenantFeatureController.getAll
);

// Obtener una feature por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'tenant_features'),
    getTenantFeatureByIdValidator,
    validateRequest,
    tenantFeatureController.getById
);

// 🔹 DataTable (debe ir antes de create)
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'tenant_features'),
    tenantFeatureController.getDatatable
);

// Crear una nueva feature
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'tenant_features'),
    createTenantFeatureValidator,
    validateRequest,
    tenantFeatureController.create
);

// Actualizar feature existente
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'tenant_features'),
    updateTenantFeatureValidator,
    validateRequest,
    tenantFeatureController.update
);

// Eliminar feature
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'tenant_features'),
    getTenantFeatureByIdValidator,
    validateRequest,
    tenantFeatureController.remove
);

module.exports = router;
