// src/modules/supplier/supplier.routes.js
const express = require('express');
const router = express.Router();

const supplierController = require('./supplier.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    createSupplierValidator,
    updateSupplierValidator,
    getSupplierByIdValidator,
} = require('./supplier.validator');

// =========================
// RUTAS DE PROVEEDORES
// =========================

// 🔹 Listar todos los proveedores
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'suppliers'),
    supplierController.getAll
);

// 🔹 Obtener un proveedor por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'suppliers'),
    getSupplierByIdValidator,
    validateRequest,
    supplierController.getOne
);

// 🔹 DataTable con búsqueda y filtros
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'suppliers'),
    supplierController.getDatatable
);

// 🟢 Crear nuevo proveedor
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'suppliers'),
    createSupplierValidator,
    validateRequest,
    supplierController.create
);

// 🟡 Actualizar proveedor existente
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'suppliers'),
    updateSupplierValidator,
    validateRequest,
    supplierController.update
);

// 🔴 Eliminar proveedor (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'suppliers'),
    getSupplierByIdValidator,
    validateRequest,
    supplierController.softDelete
);

module.exports = router;
