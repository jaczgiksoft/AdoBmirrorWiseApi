const express = require('express');
const router = express.Router();

const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const cashRegisterController = require('./cashRegister.controller');
const { createCashRegisterValidator, updateCashRegisterValidator, getCashRegisterByIdValidator } = require('./cashRegister.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

const checkCashRegisterCreation = require('../../middlewares/checkCashRegisterCreation.middleware');

// =====================
// CASH REGISTERS ROUTES
// =====================
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cashRegisters'),
    cashRegisterController.getAll
);

router.get(
    '/by-code/:code',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cashRegisters'),
    cashRegisterController.getByCode
);

router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cashRegisters'),
    getCashRegisterByIdValidator,
    validateRequest,
    cashRegisterController.getById
);

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cashRegisters'),
    cashRegisterController.getDatatable
);

router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'cashRegisters'),
    checkCashRegisterCreation,
    createCashRegisterValidator,
    validateRequest,
    cashRegisterController.create
);

router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'cashRegisters'),
    updateCashRegisterValidator,
    validateRequest,
    cashRegisterController.update
);

router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'cashRegisters'),
    getCashRegisterByIdValidator,
    validateRequest,
    cashRegisterController.remove
);

module.exports = router;
