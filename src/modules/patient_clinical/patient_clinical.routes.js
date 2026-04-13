// src/modules/patient_clinical/patient_clinical.routes.js
const { Router } = require('express');
const router = Router();
const patientClinicalController = require('./patient_clinical.controller');
const { validateGetByPatient, validateUpsert } = require('./patient_clinical.validator');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

// Todas las rutas requieren autenticación
router.use(validateToken);

router.get('/patient/:patientId', 
    validateGetByPatient, 
    validateRequest, 
    patientClinicalController.getByPatient
);

router.post('/upsert', 
    validateUpsert, 
    validateRequest, 
    patientClinicalController.upsert
);

module.exports = router;
