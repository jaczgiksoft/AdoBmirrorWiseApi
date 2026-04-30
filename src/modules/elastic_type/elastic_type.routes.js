const express = require('express');
const router = express.Router();

const elasticTypeController = require('./elastic_type.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createElasticTypeValidator,
    updateElasticTypeValidator,
    getElasticTypeByIdValidator,
} = require('./elastic_type.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS TIPOS DE ELÁSTICOS
// =========================

// 📊 DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'elastic_types'),
    elasticTypeController.getDatatable
);

// 📋 Obtener todos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'elastic_types'),
    elasticTypeController.getAll
);

// 🔍 Obtener por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'elastic_types'),
    getElasticTypeByIdValidator,
    validateRequest,
    elasticTypeController.getOne
);

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'elastic_types'),
    createElasticTypeValidator,
    validateRequest,
    elasticTypeController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'elastic_types'),
    updateElasticTypeValidator,
    validateRequest,
    elasticTypeController.update
);

// 🔴 Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'elastic_types'),
    getElasticTypeByIdValidator,
    validateRequest,
    elasticTypeController.softDelete
);

module.exports = router;
