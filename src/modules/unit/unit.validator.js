// src/modules/unit/unit.validator.js
const { body, param } = require('express-validator');

const createUnitValidator = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('symbol').trim().notEmpty().withMessage('El símbolo es obligatorio'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Estado inválido')
];

const updateUnitValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createUnitValidator
];

const getUnitByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createUnitValidator,
    updateUnitValidator,
    getUnitByIdValidator
};
