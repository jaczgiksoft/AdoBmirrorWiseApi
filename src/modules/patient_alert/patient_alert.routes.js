const express = require('express');
const router = express.Router();

const patientAlertController = require('./patient_alert.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createPatientAlertValidator,
    updatePatientAlertValidator,
    getPatientAlertByIdValidator,
} = require('./patient_alert.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS ALERTAS DE PACIENTE
// =========================

// 📋 Obtener todas las alertas de un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_alerts'),
    validateRequest,
    patientAlertController.getByPatient
);

// 🟢 Crear nueva alerta
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patient_alerts'),
    createPatientAlertValidator,
    validateRequest,
    patientAlertController.create
);

// 🟡 Actualizar alerta
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patient_alerts'),
    updatePatientAlertValidator,
    validateRequest,
    patientAlertController.update
);

// 🔴 Eliminar alerta (borrado físico con log)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patient_alerts'),
    getPatientAlertByIdValidator,
    validateRequest,
    patientAlertController.remove
);

module.exports = router;
