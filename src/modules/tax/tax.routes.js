// src/modules/tax/tax.routes.js
const express = require('express');
const router = express.Router();

const taxController = require('./tax.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { createTaxValidator, updateTaxValidator, getTaxByIdValidator } = require('./tax.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require("../../middlewares/loadPermissions.middleware");

// Lista
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'taxes'),
    taxController.getAll
);

// Detalle
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'taxes'),
    getTaxByIdValidator,
    validateRequest,
    taxController.getOne
);

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'taxes'),
    taxController.getDatatable
);

// Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'taxes'),
    createTaxValidator,
    validateRequest,
    taxController.create
);

// Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'taxes'),
    updateTaxValidator,
    validateRequest,
    taxController.update
);

// Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'taxes'),
    getTaxByIdValidator,
    validateRequest,
    taxController.softDelete
);

module.exports = router;
