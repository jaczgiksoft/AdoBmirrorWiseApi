const { body, param } = require('express-validator');

const createRepresentativeValidator = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 150 }),

    body('relationship')
        .optional()
        .isLength({ max: 50 }),

    body('phone')
        .optional()
        .isString(),

    body('phone_alt')
        .optional()
        .isString(),

    body('email')
        .optional()
        .isEmail().withMessage('Correo inválido'),

    body('address')
        .optional()
        .isString(),

    body('username')
        .optional()
        .isString(),

    body('password')
        .optional()
        .isString(),

    body('can_login')
        .optional()
        .isBoolean(),

    body('first_login')
        .optional()
        .isBoolean()
];

const updateRepresentativeValidator = [
    param('id').isInt().withMessage('ID inválido'),
    ...createRepresentativeValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    })
];

const getRepresentativeByIdValidator = [
    param('id').isInt().withMessage('ID inválido')
];

module.exports = {
    createRepresentativeValidator,
    updateRepresentativeValidator,
    getRepresentativeByIdValidator
};
