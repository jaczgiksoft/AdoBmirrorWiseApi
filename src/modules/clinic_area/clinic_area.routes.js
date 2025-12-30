const express = require('express');
const router = express.Router();

const clinicAreaController = require('./clinic_area.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createClinicAreaValidator,
    updateClinicAreaValidator,
    getClinicAreaByIdValidator,
} = require('./clinic_area.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS ÁREAS CLÍNICAS
// =========================

// 📊 DataTable áreas clínicas
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'clinic_areas'),
    clinicAreaController.getDatatable
);

// 📋 Obtener todas las áreas clínicas
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'clinic_areas'),
    validateRequest,
    clinicAreaController.getAll
);

// 🔍 Obtener un área clínica por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'clinic_areas'),
    getClinicAreaByIdValidator,
    validateRequest,
    clinicAreaController.getOne
);

// 🟢 Crear nueva área clínica
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'clinic_areas'),
    createClinicAreaValidator,
    validateRequest,
    clinicAreaController.create
);

// 🟡 Actualizar área clínica
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'clinic_areas'),
    updateClinicAreaValidator,
    validateRequest,
    clinicAreaController.update
);

// 🔴 Eliminar área clínica (borrado lógico)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'clinic_areas'),
    getClinicAreaByIdValidator,
    validateRequest,
    clinicAreaController.remove
);

module.exports = router;
