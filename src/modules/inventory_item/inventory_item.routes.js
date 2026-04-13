const express = require('express');
const router = express.Router();

const itemController = require('./inventory_item.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { uploadInventoryImage } = require('../../middlewares/upload.middleware');
const { createItemValidator, updateItemValidator, getItemByIdValidator } = require('./inventory_item.validator');

router.get(
    '/',
    validateToken,
    itemController.getAll
);

router.get(
    '/:id',
    validateToken,
    getItemByIdValidator,
    validateRequest,
    itemController.getOne
);

router.post(
    '/',
    validateToken,
    uploadInventoryImage,
    createItemValidator,
    validateRequest,
    itemController.create
);

router.put(
    '/:id',
    validateToken,
    uploadInventoryImage,
    updateItemValidator,
    validateRequest,
    itemController.update
);

router.delete(
    '/:id',
    validateToken,
    getItemByIdValidator,
    validateRequest,
    itemController.softDelete
);

module.exports = router;
