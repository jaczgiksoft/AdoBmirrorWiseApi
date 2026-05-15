// src/modules/periodontogram/periodontogram.routes.js
const { Router } = require('express');
const router = Router();
const periodontogramController = require('./periodontogram.controller');
const { validateGetByPatient, validateUpsert, validateDelete } = require('./periodontogram.validator');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

router.get('/patient/:patientId/latest',
    validateToken,
    validateGetByPatient,
    validateRequest,
    periodontogramController.getLatestByPatient
);

router.get('/patient/:patientId',
    validateToken,
    validateGetByPatient,
    validateRequest,
    periodontogramController.getAllByPatient
);

router.post('/upsert',
    validateToken,
    validateUpsert,
    validateRequest,
    periodontogramController.upsert
);

router.delete('/:id',
    validateToken,
    validateDelete,
    validateRequest,
    periodontogramController.remove
);

module.exports = router;
