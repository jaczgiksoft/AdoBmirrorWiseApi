const { Router } = require('express');
const router = Router();
const patientElasticController = require('./patient_elastic.controller');
const { validateGetByPatient, validateSave, validateId } = require('./patient_elastic.validator');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { uploadElasticPreview } = require('../../middlewares/upload.middleware');
const parseJsonFields = require('../../middlewares/parseJsonFields.middleware');

router.get('/patient/:patientId',
    validateToken,
    validateGetByPatient,
    validateRequest,
    patientElasticController.getByPatient
);

router.post('/',
    validateToken,
    uploadElasticPreview,
    parseJsonFields,
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

router.put('/:id',
    validateToken,
    uploadElasticPreview,
    parseJsonFields,
    validateId,
    validateSave,
    validateRequest,
    patientElasticController.update
);

module.exports = router;
