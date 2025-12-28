const { body, param } = require('express-validator');

const createExtractionValidator = [
    body('order').notEmpty().withMessage('order es requerido'),
    body('teeth').notEmpty().withMessage('teeth es requerido'),
];

const validateParamsId = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
];

const validatePatientId = [
    param('patient_id').isInt().withMessage('El patient_id debe ser un número entero'),
];

module.exports = {
    createExtractionValidator,
    validateParamsId,
    validatePatientId,
};
