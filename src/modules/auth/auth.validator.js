// src/modules/auth/auth.validator.js
const { body } = require('express-validator');

// 🔹 LOGIN
const loginValidator = [
    body('tenant')
        .exists().withMessage('El código de tenant es obligatorio')
        .bail()
        .trim()
        .notEmpty().withMessage('El código de tenant no puede estar vacío'),

    body('username')
        .exists().withMessage('El nombre de usuario es obligatorio')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre de usuario no puede estar vacío'),

    body('password')
        .exists().withMessage('La contraseña es obligatoria')
        .bail()
        .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres')
];

// 🔹 OLVIDÉ CONTRASEÑA
const forgotPasswordValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('El correo es obligatorio')
        .isEmail().withMessage('El correo debe tener un formato válido')
        .normalizeEmail({ gmail_remove_dots: false })
];

// 🔹 RESETEAR CONTRASEÑA
const resetPasswordValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('El token es obligatorio')
        .isLength({ min: 64, max: 64 }).withMessage('El token debe tener 64 caracteres')
        .isHexadecimal().withMessage('El token debe ser hexadecimal'),

    body('new_password')
        .trim()
        .notEmpty().withMessage('La nueva contraseña es obligatoria')
        .matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/)
        .withMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial')
];

module.exports = {
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};
