const express = require('express');
const router = express.Router();

const serviceController = require('./service.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createServiceValidator,
    updateServiceValidator,
    getServiceByIdValidator,
} = require('./service.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS SERVICIOS
// =========================

// 📊 DataTable servicios
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'services'),
    serviceController.getDatatable
);

// 📋 Obtener todos los servicios
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'services'),
    validateRequest,
    serviceController.getAll
);

// 🔍 Obtener un servicio por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'services'),
    getServiceByIdValidator,
    validateRequest,
    serviceController.getOne
);

// 🟢 Crear nuevo servicio
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'services'),
    createServiceValidator,
    validateRequest,
    serviceController.create
);

// 🟡 Actualizar servicio
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'services'),
    updateServiceValidator,
    validateRequest,
    serviceController.update
);

// 🔴 Eliminar servicio (borrado lógico)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'services'),
    getServiceByIdValidator,
    validateRequest,
    serviceController.remove
);

module.exports = router;
