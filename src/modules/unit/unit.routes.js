// src/modules/unit/unit.routes.js
const express = require('express');
const router = express.Router();

const unitController = require('./unit.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { createUnitValidator, updateUnitValidator, getUnitByIdValidator } = require('./unit.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require("../../middlewares/loadPermissions.middleware");

// Lista
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'units'),
    unitController.getAll
);

// Detalle
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'units'),
    getUnitByIdValidator,
    validateRequest,
    unitController.getOne
);

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'units'),
    unitController.getDatatable
);

// Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'units'),
    createUnitValidator,
    validateRequest,
    unitController.create
);

// Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'units'),
    updateUnitValidator,
    validateRequest,
    unitController.update
);

// Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'units'),
    getUnitByIdValidator,
    validateRequest,
    unitController.softDelete
);

module.exports = router;
