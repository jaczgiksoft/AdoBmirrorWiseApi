const express = require('express');
const router = express.Router();

const movementController = require('./inventory_movement.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { createMovementValidator } = require('./inventory_movement.validator');

router.get(
    '/',
    validateToken,
    movementController.getAll
);

router.post(
    '/',
    validateToken,
    createMovementValidator,
    validateRequest,
    movementController.create
);

module.exports = router;
