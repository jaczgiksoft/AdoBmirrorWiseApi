const express = require('express');
const router = express.Router();

const patientPrescriptionController = require('./patient_prescription.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createPatientPrescriptionValidator,
    updatePatientPrescriptionValidator,
    getPatientPrescriptionByIdValidator,
    getPrescriptionsByPatientIdValidator,
} = require('./patient_prescription.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS PRESCRIPCIONES DE PACIENTE
// =========================

// 📋 Obtener todas las prescripciones de un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    getPrescriptionsByPatientIdValidator,
    validateRequest,
    patientPrescriptionController.getByPatient
);

// 🟢 Crear nueva prescripción
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    createPatientPrescriptionValidator,
    validateRequest,
    patientPrescriptionController.create
);

// 🟡 Actualizar prescripción
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patients'),
    updatePatientPrescriptionValidator,
    validateRequest,
    patientPrescriptionController.update
);

// 🔴 Eliminar prescripción (borrado físico con log)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patients'),
    getPatientPrescriptionByIdValidator,
    validateRequest,
    patientPrescriptionController.remove
);

module.exports = router;
