// src/modules/tenant/tenant.routes.js
const express = require('express');
const router = express.Router();

const tenantController = require('./tenant.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { createTenantValidator, updateTenantValidator, getTenantByIdValidator } = require('./tenant.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS TENANTS
// =========================

// ⚙️ Obtener configuración del tenant autenticado
router.get(
    '/settings',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'settings'),
    tenantController.getSettings
);

// 📋 Listar todos los tenants (solo superadmin)
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'tenants'),
    tenantController.getAll
);

// 📊 DataTable (debe ir antes de create)
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'tenants'),
    tenantController.getDatatable
);

// 🔍 Detalle de un tenant por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'tenants'),
    getTenantByIdValidator,
    validateRequest,
    tenantController.getOne
);

// 🟢 Crear nuevo tenant (solo superadmin)
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'tenants'),
    createTenantValidator,
    validateRequest,
    tenantController.create
);

// 🟡 Actualizar tenant (nombre, info, margen, etc.)
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'tenants'),
    updateTenantValidator,
    validateRequest,
    tenantController.update
);

// 🔴 Eliminar tenant (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'tenants'),
    getTenantByIdValidator,
    validateRequest,
    tenantController.softDelete
);

module.exports = router;
