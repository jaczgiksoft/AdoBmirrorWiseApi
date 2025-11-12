const express = require('express');
const router = express.Router();

const patientConversationController = require('./patient_conversation.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createPatientConversationValidator,
    updatePatientConversationValidator,
    getPatientConversationByIdValidator,
    getConversationsByPatientIdValidator,
} = require('./patient_conversation.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS CONVERSACIONES DE PACIENTE
// =========================

// 📋 Obtener todas las conversaciones de un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_conversations'),
    getConversationsByPatientIdValidator,
    validateRequest,
    patientConversationController.getByPatient
);

// 🔍 Obtener una conversación específica por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_conversations'),
    getPatientConversationByIdValidator,
    validateRequest,
    patientConversationController.getById
);

// 🟢 Crear nueva conversación
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patient_conversations'),
    createPatientConversationValidator,
    validateRequest,
    patientConversationController.create
);

// 🟡 Actualizar conversación
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patient_conversations'),
    updatePatientConversationValidator,
    validateRequest,
    patientConversationController.update
);

// 🔴 Eliminar conversación
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patient_conversations'),
    getPatientConversationByIdValidator,
    validateRequest,
    patientConversationController.remove
);

module.exports = router;
