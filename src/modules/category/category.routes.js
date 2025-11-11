// src/modules/category/category.routes.js
const express = require('express');
const router = express.Router();

const categoryController = require('./category.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { createCategoryValidator, updateCategoryValidator, getCategoryByIdValidator } = require('./category.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require("../../middlewares/loadPermissions.middleware");

// Lista de categorías
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'categories'),
    categoryController.getAll
);

// Detalle
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'categories'),
    getCategoryByIdValidator,
    validateRequest,
    categoryController.getOne
);

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'categories'),
    categoryController.getDatatable
);

// Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'categories'),
    createCategoryValidator,
    validateRequest,
    categoryController.create
);

// Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'categories'),
    updateCategoryValidator,
    validateRequest,
    categoryController.update
);

// Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'categories'),
    getCategoryByIdValidator,
    validateRequest,
    categoryController.softDelete
);

module.exports = router;
