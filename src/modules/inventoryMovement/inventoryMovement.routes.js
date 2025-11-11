// src/modules/inventoryMovement/inventoryMovement.routes.js
const express = require('express');
const router = express.Router();

const inventoryMovementController = require('./inventoryMovement.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { createInventoryMovementValidator, getMovementByIdValidator } = require('./inventoryMovement.validator');

// Crear movimiento
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'inventoryMovements'),
    createInventoryMovementValidator,
    validateRequest,
    inventoryMovementController.create
);

// Detalle de movimiento
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'inventoryMovements'),
    getMovementByIdValidator,
    validateRequest,
    inventoryMovementController.getOne
);

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'inventoryMovements'),
    inventoryMovementController.getDatatable
);

module.exports = router;
