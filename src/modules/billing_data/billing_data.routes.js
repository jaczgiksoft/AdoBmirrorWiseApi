const express = require('express');
const router = express.Router();

const billingController = require('./billing_data.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createBillingValidator,
    updateBillingValidator,
    getBillingByIdValidator
} = require('./billing_data.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');

// =========================
// RUTAS DATOS FISCALES
// =========================

// 📋 Listar todos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'billing_data'),
    billingController.getAll
);

// 🔍 Obtener uno
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'billing_data'),
    getBillingByIdValidator,
    validateRequest,
    billingController.getOne
);

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'billing_data'),
    createBillingValidator,
    validateRequest,
    billingController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'billing_data'),
    updateBillingValidator,
    validateRequest,
    billingController.update
);

// 🔴 Eliminar (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'billing_data'),
    getBillingByIdValidator,
    validateRequest,
    billingController.remove
);

module.exports = router;
