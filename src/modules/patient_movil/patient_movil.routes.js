const express = require('express');
const router = express.Router();

const patientMovilController = require('./patient_movil.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const {
    registerTokenValidator,
    removeTokenValidator
} = require('./patient_movil.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');

// =========================
// RUTAS PATIENT_MOVIL
// ========================= 

// 🟢 Registrar o actualizar token de dispositivo móvil
router.post(
    '/register-token',
    validateToken,
    registerTokenValidator,
    validateRequest,
    patientMovilController.registerToken
);

// 🔴 Eliminar token
router.delete(
    '/remove-token',
    validateToken,
    removeTokenValidator,
    validateRequest,
    patientMovilController.removeToken
);

module.exports = router;
