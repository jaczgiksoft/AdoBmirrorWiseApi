const express = require('express');
const router = express.Router();

const activityCatalogController = require('./activity_catalog.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createValidator,
    updateValidator,
    getByIdValidator,
} = require('./activity_catalog.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// 📋 Obtener todas las actividades del catálogo
router.get(
    '/',
    validateToken,
    validateRequest,
    activityCatalogController.getAll
);

// 🔍 Obtener una actividad por ID
router.get(
    '/:id',
    validateToken,
    getByIdValidator,
    validateRequest,
    activityCatalogController.getOne
);

// 🟢 Crear nueva actividad
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'appointments'),
    createValidator,
    validateRequest,
    activityCatalogController.create
);

// 🟡 Actualizar actividad existente
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'appointments'),
    updateValidator,
    validateRequest,
    activityCatalogController.update
);

// 🔴 Eliminar actividad (borrado lógico)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'appointments'),
    getByIdValidator,
    validateRequest,
    activityCatalogController.remove
);

module.exports = router;
