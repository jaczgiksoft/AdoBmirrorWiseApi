// src/modules/tenantFeature/tenantFeature.validator.js
const { body, param } = require('express-validator');

// =====================
// CREATE
// =====================
const createTenantFeatureValidator = [
    body('feature')
        .trim()
        .notEmpty().withMessage('El nombre de la feature es obligatorio')
        .isString().withMessage('La feature debe ser texto válido'),

    body('is_enabled')
        .optional()
        .isBoolean().withMessage('El campo is_enabled debe ser booleano')
];

// =====================
// UPDATE
// =====================
const updateTenantFeatureValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),

    body('feature')
        .optional()
        .isString().withMessage('La feature debe ser texto válido'),

    body('is_enabled')
        .optional()
        .isBoolean().withMessage('El campo is_enabled debe ser booleano')
];

// =====================
// GET BY ID
// =====================
const getTenantFeatureByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createTenantFeatureValidator,
    updateTenantFeatureValidator,
    getTenantFeatureByIdValidator
};
