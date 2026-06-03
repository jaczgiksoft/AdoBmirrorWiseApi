const express = require('express');
const router = express.Router();

const appointmentMovilController = require('./movil.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { getPatientClinicalHistoryMobileValidator } = require('./movil.validator');
const { getAppointmentEvaluationValidator } = require('../appointment/appointment.validator');

// =========================
// RUTAS APPOINTMENT MOBILE
// ========================= 

// 🔍 Historial clínico de paciente (Acceso Mobile)
router.get(
    '/clinical-history',
    validateToken, // Obtenemos la identidad del paciente
    // Se omiten loadPermissions y checkPermissions para el acceso móvil
    getPatientClinicalHistoryMobileValidator,
    validateRequest,
    appointmentMovilController.getPatientClinicalHistory
);

// 🔍 Obtener evaluación de cita (Acceso Mobile)
router.get(
    '/appointment/:id/evaluation',
    validateToken,
    getAppointmentEvaluationValidator,
    validateRequest,
    appointmentMovilController.getAppointmentEvaluation
);

// 📋 Obtener catálogo de actividades (Acceso Mobile)
router.get(
    '/activity-catalog',
    validateToken,
    validateRequest,
    appointmentMovilController.getActivityCatalog
);

module.exports = router;
