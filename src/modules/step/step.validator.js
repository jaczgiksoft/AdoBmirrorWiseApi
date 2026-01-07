const { body, param } = require('express-validator');

const createStepValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),

    body('description')
        .optional()
        .trim(),

    body('duration_minutes')
        .isInt({ gt: 0 }).withMessage('La duración debe ser mayor a 0'),
];

const updateStepValidator = [
    param('id').isInt().withMessage('El ID debe ser entero'),
    ...createStepValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

const getStepByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser entero'),
];

module.exports = {
    createStepValidator,
    updateStepValidator,
    getStepByIdValidator,
};
