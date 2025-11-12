// src/modules/bracket_type/bracket_type.routes.js
const express = require('express');
const router = express.Router();

const bracketTypeController = require('./bracket_type.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const {
    createBracketTypeValidator,
    updateBracketTypeValidator,
    getBracketTypeByIdValidator,
} = require('./bracket_type.validator');

// =========================
// RUTAS: TIPOS DE BRACKET
// =========================

// 📊 DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'bracket_types'),
    bracketTypeController.getDatatable
);

// 📋 Listar todos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'bracket_types'),
    bracketTypeController.getAll
);

// 🔍 Obtener por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'bracket_types'),
    getBracketTypeByIdValidator,
    validateRequest,
    bracketTypeController.getOne
);

// 🟢 Crear nuevo
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'bracket_types'),
    createBracketTypeValidator,
    validateRequest,
    bracketTypeController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'bracket_types'),
    updateBracketTypeValidator,
    validateRequest,
    bracketTypeController.update
);

// 🔴 Eliminar (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'bracket_types'),
    getBracketTypeByIdValidator,
    validateRequest,
    bracketTypeController.softDelete
);

module.exports = router;
