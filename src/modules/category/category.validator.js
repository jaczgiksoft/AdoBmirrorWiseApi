// src/modules/category/category.validator.js
const { body, param } = require('express-validator');

const createCategoryValidator = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Estado inválido')
];

const updateCategoryValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createCategoryValidator
];

const getCategoryByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createCategoryValidator,
    updateCategoryValidator,
    getCategoryByIdValidator
};
