const express = require('express');
const router = express.Router();

const providerController = require('./inventory_provider.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { createProviderValidator, updateProviderValidator, getProviderByIdValidator } = require('./inventory_provider.validator');
// Note: Optional permissions checking can be added here if defined: e.g. checkPermissions('read', 'inventory')

router.get(
    '/',
    validateToken,
    providerController.getAll
);

router.get(
    '/:id',
    validateToken,
    getProviderByIdValidator,
    validateRequest,
    providerController.getOne
);

router.post(
    '/',
    validateToken,
    createProviderValidator,
    validateRequest,
    providerController.create
);

router.put(
    '/:id',
    validateToken,
    updateProviderValidator,
    validateRequest,
    providerController.update
);

router.delete(
    '/:id',
    validateToken,
    getProviderByIdValidator,
    validateRequest,
    providerController.softDelete
);

module.exports = router;
