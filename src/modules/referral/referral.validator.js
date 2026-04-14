const { body, param } = require('express-validator');

// 🟢 Crear referidor
const createReferralValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 120 }).withMessage('Máximo 120 caracteres'),

    body('contact_name')
        .optional({ checkFalsy: true }).trim()
        .isLength({ max: 120 }),

    body('contact_phone')
        .optional({ checkFalsy: true }).trim()
        .isLength({ max: 20 }),

    body('contact_email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Debe ser un correo válido'),

    body('notes').optional({ checkFalsy: true }).trim()
];

// 🟡 Actualizar → todo opcional
const updateReferralValidator = [
    param('id').isInt().withMessage('ID inválido'),
    ...createReferralValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    })
];

// 🔍 Obtener por ID
const getReferralByIdValidator = [
    param('id').isInt().withMessage('ID inválido'),
];

module.exports = {
    createReferralValidator,
    updateReferralValidator,
    getReferralByIdValidator
};
