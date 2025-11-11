const express = require('express');
const router = express.Router();

const productController = require('./product.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createProductValidator,
    updateProductValidator,
    getProductByIdValidator,
} = require('./product.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// ===============================
// 🧩 PRODUCTOS (CRUD + Datatable)
// ===============================

// 🔹 Obtener todos los productos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'products'),
    productController.getAll
);

// 🔹 Obtener producto por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'products'),
    getProductByIdValidator,
    validateRequest,
    productController.getOne
);

// 🔹 DataTable (paginación, búsqueda, filtros)
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'products'),
    productController.getDatatable
);

// 🔹 Crear nuevo producto
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'products'),
    createProductValidator,
    validateRequest,
    productController.create
);

// 🔹 Actualizar producto existente
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'products'),
    updateProductValidator,
    validateRequest,
    productController.update
);

// 🔹 Eliminación lógica (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'products'),
    getProductByIdValidator,
    validateRequest,
    productController.softDelete
);

module.exports = router;
