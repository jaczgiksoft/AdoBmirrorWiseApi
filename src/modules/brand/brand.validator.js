// src/modules/brand/brand.validator.js
const { body, param } = require('express-validator');

const createBrandValidator = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Estado inválido')
];

const updateBrandValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createBrandValidator
];

const getBrandByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createBrandValidator,
    updateBrandValidator,
    getBrandByIdValidator
};
