// src/modules/auth/auth.validator.js
const { body } = require('express-validator');

/**
 * 🔹 LOGIN
 * Se usa para validar credenciales antes de autenticar.
 * Ahora soporta login por usuario o email dentro del tenant.
 */
const loginValidator = [
    body('tenant')
        .exists().withMessage('El código del tenant es obligatorio')
        .bail()
        .trim()
        .notEmpty().withMessage('El código del tenant no puede estar vacío')
        .isString().withMessage('El código del tenant debe ser texto'),

    body('username')
        .exists().withMessage('El usuario o correo es obligatorio')
        .bail()
        .trim()
        .notEmpty().withMessage('El usuario o correo no puede estar vacío'),

    body('password')
        .exists().withMessage('La contraseña es obligatoria')
        .bail()
        .isString().withMessage('La contraseña debe ser texto')
        .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres')
];

/**
 * 🔹 OLVIDÉ CONTRASEÑA
 */
const forgotPasswordValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('El correo es obligatorio')
        .isEmail().withMessage('El correo debe tener un formato válido')
        .normalizeEmail({ gmail_remove_dots: false })
];

/**
 * 🔹 RESETEAR CONTRASEÑA
 */
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

/**
 * 🔹 REFRESH TOKEN
 */
const refreshTokenValidator = [
    body('refresh_token')
        .exists().withMessage('El refresh token es obligatorio')
        .bail()
        .trim()
        .notEmpty().withMessage('El refresh token no puede estar vacío')
        .isHexadecimal().withMessage('Formato de token inválido')
];

/**
 * 🔹 LOGIN PATIENT
 * Valida el login de pacientes (no se requiere tenant explícito)
 */
const patientLoginValidator = [
    body('username')
        .exists().withMessage('El usuario es obligatorio')
        .bail()
        .trim()
        .notEmpty().withMessage('El usuario no puede estar vacío'),

    body('password')
        .exists().withMessage('La contraseña es obligatoria')
        .bail()
        .isString().withMessage('La contraseña debe ser texto')
        .notEmpty().withMessage('La contraseña no puede estar vacía')
];

module.exports = {
    loginValidator,
    patientLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    refreshTokenValidator
};
