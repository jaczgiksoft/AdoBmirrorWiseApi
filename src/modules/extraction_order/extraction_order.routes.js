const express = require('express');
const router = express.Router();

const controller = require('./extraction_order.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { uploadRadiographs } = require('../../middlewares/upload.middleware');
const parseMultipartData = require('../../middlewares/parseMultipartData');
const { createExtractionOrderValidator } = require('./extraction_order.validator');

// Routes definitions
router.post('/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    uploadRadiographs,
    parseMultipartData,
    createExtractionOrderValidator,
    validateRequest,
    controller.createOrder
);

router.get('/patient/:patientId',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    controller.getOrdersByPatient
);

router.get('/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patients'),
    controller.getOrderById
);

router.put('/:id',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patients'),
    controller.updateOrder
);

router.delete('/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patients'),
    controller.deleteOrder
);

module.exports = router;
