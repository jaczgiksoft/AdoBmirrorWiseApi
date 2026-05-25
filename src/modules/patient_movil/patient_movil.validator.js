const { body } = require('express-validator');

// 🟢 Registrar token
const registerTokenValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('El token es obligatorio')
        .isString().withMessage('El token debe ser una cadena de texto'),
    body('patient_id')
        .optional()
        .isInt().withMessage('El patient_id debe ser un número entero')
];

// 🔴 Remover token
const removeTokenValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('El token es obligatorio')
        .isString().withMessage('El token debe ser una cadena de texto'),
    body('patient_id')
        .optional()
        .isInt().withMessage('El patient_id debe ser un número entero')
];

module.exports = {
    registerTokenValidator,
    removeTokenValidator
};
