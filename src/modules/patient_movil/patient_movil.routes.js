const express = require('express');
const router = express.Router();

const patientMovilController = require('./patient_movil.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

// =========================
// RUTAS PATIENT_MOVIL
// ========================= 

// Registrar o actualizar token de dispositivo móvil
router.post(
    '/register-token',
    validateToken,
    patientMovilController.registerToken
);

// (Opcional) Eliminar token
router.delete(
    '/remove-token',
    validateToken,
    patientMovilController.removeToken
);

module.exports = router;
