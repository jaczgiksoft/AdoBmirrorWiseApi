// src/modules/brand/brand.routes.js
const express = require('express');
const router = express.Router();

const brandController = require('./brand.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { createBrandValidator, updateBrandValidator, getBrandByIdValidator } = require('./brand.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require("../../middlewares/loadPermissions.middleware");

// Lista
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'brands'),
    brandController.getAll
);

// Detalle
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'brands'),
    getBrandByIdValidator,
    validateRequest,
    brandController.getOne
);

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'brands'),
    brandController.getDatatable
);

// Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'brands'),
    createBrandValidator,
    validateRequest,
    brandController.create
);

// Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'brands'),
    updateBrandValidator,
    validateRequest,
    brandController.update
);

// Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'brands'),
    getBrandByIdValidator,
    validateRequest,
    brandController.softDelete
);

module.exports = router;
