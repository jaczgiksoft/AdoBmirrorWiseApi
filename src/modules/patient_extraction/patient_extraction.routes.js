const express = require('express');
const router = express.Router();

const extractionController = require('./patient_extraction.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const parseJsonFields = require('../../middlewares/parseJsonFields.middleware');
const { uploadRadiographs } = require('../../middlewares/upload.middleware');
const { validateParamsId, validatePatientId } = require('./patient_extraction.validator');

// 🟢 Crear Orden
router.post('/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    uploadRadiographs,
    parseJsonFields,
    extractionController.create
);

// 🔍 Listar por Paciente
router.get('/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    validatePatientId,
    validateRequest,
    extractionController.getByPatient
);

// 🔍 Detalle
router.get('/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    validateParamsId,
    validateRequest,
    extractionController.getOne
);

// ✏️ Editar
router.put('/:id',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    validateParamsId,
    uploadRadiographs,
    parseJsonFields,
    extractionController.update
);

// 🔴 Eliminar
router.delete('/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patients'),
    validateParamsId,
    validateRequest,
    extractionController.remove
);

module.exports = router;
