const express = require('express');
const router = express.Router();

const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

const cashMovementController = require('./cashMovement.controller');
const { createMovementValidator, getMovementByIdValidator } = require('./cashMovement.validator');

// =====================
// CASH MOVEMENTS ROUTES
// =====================

// 🔹 DataTable (debe ir antes de create)
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cash_movements'),
    cashMovementController.getDatatable
);

// Crear nuevo movimiento
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'cash_movements'),
    createMovementValidator,
    validateRequest,
    cashMovementController.create
);

// Detalle de movimiento
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cash_movements'),
    getMovementByIdValidator,
    validateRequest,
    cashMovementController.getById
);

module.exports = router;
