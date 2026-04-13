// src/modules/positions/position.routes.js
const express = require('express');
const positionController = require('./position.controller');
const positionValidator = require('./position.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { validateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren autenticación

router.get('/', positionController.getPositions);
router.get('/:id', positionController.getPosition);

router.post('/', 
    positionValidator.createPosition, 
    validateRequest, 
    positionController.createPosition
);

router.put('/:id', 
    positionValidator.updatePosition, 
    validateRequest, 
    positionController.updatePosition
);

router.delete('/:id', positionController.deletePosition);

router.post('/datatable', positionController.datatable);

module.exports = router;
