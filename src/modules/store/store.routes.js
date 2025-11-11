// src/modules/store/store.routes.js
const express = require('express');
const router = express.Router();

const storeController = require('./store.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { createStoreValidator, updateStoreValidator, getStoreByIdValidator } = require('./store.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { uploadStoreImages } = require('../../middlewares/upload.middleware'); // 🆕 manejo de logo/banner

// =========================
// RUTAS STORES
// =========================

// 📋 Listar tiendas del tenant
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'stores'),
    storeController.getAll
);

// 🔍 Obtener tienda por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'stores'),
    getStoreByIdValidator,
    validateRequest,
    storeController.getOne
);

// 📊 DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'stores'),
    storeController.getDatatable
);

// 🟢 Crear nueva tienda (con soporte de logo/banner)
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'stores'),
    uploadStoreImages, // 🧩 Maneja logo/banner antes de validar body
    createStoreValidator,
    validateRequest,
    storeController.create
);

// 🟡 Actualizar tienda (puede reemplazar imágenes)
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'stores'),
    uploadStoreImages, // 🧩 Permite subir nuevos logo/banner
    updateStoreValidator,
    validateRequest,
    storeController.update
);

// 🔴 Eliminar tienda
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'stores'),
    getStoreByIdValidator,
    validateRequest,
    storeController.softDelete
);

module.exports = router;
