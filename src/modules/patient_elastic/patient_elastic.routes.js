const { Router } = require('express');
const router = Router();
const patientElasticController = require('./patient_elastic.controller');
const { validateGetByPatient, validateSave, validateId } = require('./patient_elastic.validator');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

router.get('/patient/:patientId',
    validateToken,
    validateGetByPatient,
    validateRequest,
    patientElasticController.getByPatient
);

router.post('/',
    validateToken,
    validateSave,
    validateRequest,
    patientElasticController.create
);

router.delete('/:id',
    validateToken,
    validateId,
    validateRequest,
    patientElasticController.remove
);

module.exports = router;
