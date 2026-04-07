const express = require('express');
const router = express.Router();

const occupationController = require('./occupation.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

const {
    createOccupationValidator,
    updateOccupationValidator,
    getOccupationByIdValidator
} = require('./occupation.validator');

// =========================
// RUTAS OCUPACIONES
// =========================

// 📋 Listar todas
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'occupations'),
    occupationController.getAll
);

// 🔍 Obtener una
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'occupations'),
    getOccupationByIdValidator,
    validateRequest,
    occupationController.getOne
);

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'occupations'),
    createOccupationValidator,
    validateRequest,
    occupationController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'occupations'),
    updateOccupationValidator,
    validateRequest,
    occupationController.update
);

// 🔴 Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'occupations'),
    getOccupationByIdValidator,
    validateRequest,
    occupationController.remove
);

module.exports = router;
