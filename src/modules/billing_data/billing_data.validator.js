const { body, param } = require('express-validator');

const createBillingValidator = [
    body('business_name')
        .trim()
        .notEmpty().withMessage('El nombre o razón social es obligatorio')
        .isLength({ max: 150 }),

    body('rfc')
        .trim()
        .notEmpty().withMessage('El RFC es obligatorio')
        .isLength({ min: 12, max: 20 }),

    body('tax_regime').trim().notEmpty(),

    body('zip_code')
        .trim()
        .notEmpty()
        .isLength({ min: 4, max: 10 }),

    body('email')
        .optional()
        .isEmail().withMessage('Formato de correo inválido')
];

const updateBillingValidator = [
    param('id').isInt().withMessage('ID inválido'),
    ...createBillingValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    })
];

const getBillingByIdValidator = [
    param('id').isInt().withMessage('ID inválido')
];

module.exports = {
    createBillingValidator,
    updateBillingValidator,
    getBillingByIdValidator
};
