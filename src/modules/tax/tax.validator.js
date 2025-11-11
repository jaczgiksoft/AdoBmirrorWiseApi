// src/modules/tax/tax.validator.js
const { body, param } = require('express-validator');

const createTaxValidator = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('rate').isFloat({ min: 0 }).withMessage('La tasa debe ser un número positivo'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Estado inválido')
];

const updateTaxValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createTaxValidator
];

const getTaxByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createTaxValidator,
    updateTaxValidator,
    getTaxByIdValidator
};
