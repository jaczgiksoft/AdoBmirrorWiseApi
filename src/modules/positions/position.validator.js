// src/modules/positions/position.validator.js
const { body } = require('express-validator');

const createPosition = [
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 120 }).withMessage('El nombre no debe exceder los 120 caracteres'),
    
    body('description')
        .optional({ checkFalsy: true })
        .isString().withMessage('La descripción debe ser un texto')
        .isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres'),

    body('color')
        .optional()
        .isString().withMessage('El color debe ser un texto hexadecimal')
        .isLength({ max: 20 }),

    body('isAppointmentEligible')
        .optional()
        .isBoolean().withMessage('Debe ser un valor booleano')
];

const updatePosition = [
    body('name')
        .optional()
        .isString().withMessage('El nombre debe ser un texto')
        .isLength({ max: 120 }).withMessage('El nombre no debe exceder los 120 caracteres'),
    
    body('description')
        .optional({ checkFalsy: true })
        .isString().withMessage('La descripción debe ser un texto')
        .isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres'),

    body('color')
        .optional()
        .isString().withMessage('El color debe ser un texto hexadecimal')
        .isLength({ max: 20 }),

    body('isAppointmentEligible')
        .optional()
        .isBoolean().withMessage('Debe ser un valor booleano')
];

module.exports = {
    createPosition,
    updatePosition
};
