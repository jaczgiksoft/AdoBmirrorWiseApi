const express = require('express');
const router = express.Router();

const patientController = require('./patient.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createPatientValidator,
    updatePatientValidator,
    updatePatientGeneralValidator,
    getPatientByIdValidator,
} = require('./patient.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { uploadPatientPhoto } = require('../../middlewares/upload.middleware');
const parseJsonFields = require('../../middlewares/parseJsonFields.middleware');
// =========================
// RUTAS PACIENTES
// ========================= 

// 📋 Listar todos los pacientes (por tenant)
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    patientController.getAll
);

// 📊 DataTable (filtrado y paginación)
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    patientController.getDatatable
);

// 🆕 Obtener siguiente número de expediente
router.get(
    '/next-medical-record',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    patientController.getNextMedicalRecord
);

// 🔍 Obtener un paciente por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    getPatientByIdValidator,
    validateRequest,
    patientController.getOne
);

// 🟢 Crear nuevo paciente
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    uploadPatientPhoto,
    parseJsonFields,
    createPatientValidator,
    validateRequest,
    patientController.create
);

// 🟡 Actualizar paciente
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patients'),
    uploadPatientPhoto,
    parseJsonFields,
    updatePatientValidator,
    validateRequest,
    patientController.update
);

// 🟡 Actualizar paciente (General)
router.put(
    '/:id/general',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patients'),
    uploadPatientPhoto,
    parseJsonFields,
    updatePatientGeneralValidator,
    validateRequest,
    patientController.updateGeneral
);

// 🔴 Eliminar paciente (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patients'),
    getPatientByIdValidator,
    validateRequest,
    patientController.softDelete
);

// ⚙️ Obtener perfil completo del paciente (expediente clínico)
router.get(
    '/profile/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    getPatientByIdValidator,
    validateRequest,
    patientController.getProfile
);

// 🏠 Obtener resumen para el Home (Móvil)
router.get(
    '/:id/home-summary',
    validateToken,
    getPatientByIdValidator,
    validateRequest,
    patientController.getHomeSummary
);

module.exports = router;
