const express = require('express');
const router = express.Router();

const itemController = require('./inventory_item.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
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
    createItemValidator,
    validateRequest,
    itemController.create
);

router.put(
    '/:id',
    validateToken,
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
