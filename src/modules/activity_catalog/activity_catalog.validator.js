const { body, param } = require('express-validator');

const createValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre de la actividad es obligatorio')
        .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),

    body('is_custom')
        .optional()
        .isBoolean().withMessage('is_custom debe ser un booleano'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active debe ser un booleano'),
];

const updateValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),

    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre de la actividad es obligatorio')
        .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active debe ser un booleano'),
];

const getByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createValidator,
    updateValidator,
    getByIdValidator,
};
