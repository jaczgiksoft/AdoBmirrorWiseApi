// src/modules/odontogram/odontogram.routes.js
const { Router } = require('express');
const router = Router();
const odontogramController = require('./odontogram.controller');
const { validateGetByPatient, validateSave } = require('./odontogram.validator');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

router.get('/patient/:patientId',
    validateToken,
    validateGetByPatient,
    validateRequest,
    odontogramController.getByPatient
);

router.post('/',
    validateToken,
    validateSave,
    validateRequest,
    odontogramController.save
);

module.exports = router;
