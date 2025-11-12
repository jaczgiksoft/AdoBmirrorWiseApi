const express = require('express');
const router = express.Router();

const patientNoteController = require('./patient_note.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createPatientNoteValidator,
    updatePatientNoteValidator,
    getPatientNoteByIdValidator,
    getNotesByPatientIdValidator,
} = require('./patient_note.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS NOTAS DE PACIENTE
// =========================

// 📋 Obtener todas las notas de un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_notes'),
    getNotesByPatientIdValidator,
    validateRequest,
    patientNoteController.getByPatient
);

// 🔍 Obtener una nota específica por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_notes'),
    getPatientNoteByIdValidator,
    validateRequest,
    patientNoteController.getById
);

// 🟢 Crear nueva nota
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patient_notes'),
    createPatientNoteValidator,
    validateRequest,
    patientNoteController.create
);

// 🟡 Actualizar nota
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patient_notes'),
    updatePatientNoteValidator,
    validateRequest,
    patientNoteController.update
);

// 🔴 Eliminar nota
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patient_notes'),
    getPatientNoteByIdValidator,
    validateRequest,
    patientNoteController.remove
);

module.exports = router;
