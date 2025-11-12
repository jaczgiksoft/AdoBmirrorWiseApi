const express = require('express');
const router = express.Router();

const patientHobbyController = require('./patient_hobby.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createPatientHobbyValidator,
    updatePatientHobbyValidator,
    getPatientHobbyByIdValidator,
    getHobbiesByPatientIdValidator,
} = require('./patient_hobby.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS PASATIEMPOS DE PACIENTE
// =========================

// 📋 Obtener todos los pasatiempos de un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_hobbies'),
    getHobbiesByPatientIdValidator,
    validateRequest,
    patientHobbyController.getByPatient
);

// 🟢 Crear nuevo pasatiempo
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patient_hobbies'),
    createPatientHobbyValidator,
    validateRequest,
    patientHobbyController.create
);

// 🟡 Actualizar pasatiempo
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patient_hobbies'),
    updatePatientHobbyValidator,
    validateRequest,
    patientHobbyController.update
);

// 🔴 Eliminar pasatiempo (borrado físico con log)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patient_hobbies'),
    getPatientHobbyByIdValidator,
    validateRequest,
    patientHobbyController.remove
);

module.exports = router;
