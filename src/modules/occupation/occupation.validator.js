const { body, param } = require('express-validator');

// 🟢 Crear ocupación
const createOccupationValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 120 }).withMessage('Máximo 120 caracteres'),

    body('description')
        .optional().trim()
        .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),
];

// 🟡 Actualizar → todo opcional
const updateOccupationValidator = [
    param('id').isInt().withMessage('ID inválido'),
    ...createOccupationValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    })
];

// 🔍 Obtener por ID
const getOccupationByIdValidator = [
    param('id').isInt().withMessage('ID inválido'),
];

module.exports = {
    createOccupationValidator,
    updateOccupationValidator,
    getOccupationByIdValidator
};
