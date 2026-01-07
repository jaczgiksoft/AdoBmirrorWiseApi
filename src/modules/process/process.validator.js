const { body, param } = require('express-validator');

const createProcessValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),

    body('description')
        .optional()
        .trim(),

    body('steps')
        .optional()
        .isArray().withMessage('Steps debe ser un arreglo'),

    body('steps.*.step_id')
        .isInt({ gt: 0 }).withMessage('El ID del paso debe ser válido'),

    body('steps.*.duration_override')
        .optional({ nullable: true })
        .isInt({ gt: 0 }).withMessage('La duración override debe ser mayor a 0'),
];

const updateProcessValidator = [
    param('id').isInt().withMessage('El ID debe ser entero'),
    ...createProcessValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

const getProcessByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser entero'),
];

module.exports = {
    createProcessValidator,
    updateProcessValidator,
    getProcessByIdValidator,
};
