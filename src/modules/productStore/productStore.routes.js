// src/modules/productStore/productStore.routes.js
const express = require('express');
const router = express.Router();

const productStoreController = require('./productStore.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createProductStoreValidator,
    updateProductStoreValidator,
    getProductStoreByIdValidator,
} = require('./productStore.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

/**
 * ============================
 * PRODUCT STORE ROUTES
 * ============================
 * Prefijo: /api/product-stores
 * Estructura general:
 *   - GET    /:storeId              → Listar productos en tienda
 *   - GET    /:storeId/:id          → Obtener producto específico en tienda
 *   - POST   /:storeId/datatable    → DataTable con filtros
 *   - POST   /                      → Asignar producto a tienda
 *   - PUT    /:storeId/:id          → Actualizar configuración del producto
 *   - DELETE /:storeId/:id          → Eliminar producto de tienda (soft delete)
 */

// 🟢 Lista de productos por tienda
router.get(
    '/:storeId',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'productStores'),
    productStoreController.getAll
);

// 🔹 Detalle de producto en tienda
router.get(
    '/:storeId/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'productStores'),
    getProductStoreByIdValidator,
    validateRequest,
    productStoreController.getOne
);

// 📊 DataTable (filtrado y paginación)
router.post(
    '/:storeId/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'productStores'),
    productStoreController.getDatatable
);

// 🟢 Crear asignación producto ↔ tienda
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'productStores'),
    createProductStoreValidator,
    validateRequest,
    productStoreController.create
);

// 🟡 Actualizar configuración producto ↔ tienda
router.put(
    '/:storeId/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'productStores'),
    updateProductStoreValidator,
    validateRequest,
    productStoreController.update
);

// 🔴 Eliminar relación producto ↔ tienda (soft delete)
router.delete(
    '/:storeId/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'productStores'),
    getProductStoreByIdValidator,
    validateRequest,
    productStoreController.softDelete
);

module.exports = router;
