const { body, param } = require('express-validator');

const createRoleValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del rol es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/)
        .withMessage('El nombre solo puede contener letras, números y espacios'),

    // ✅ Nuevo campo booleano opcional
    body('requires_cash_session')
        .optional()
        .isBoolean().withMessage('El campo requires_cash_session debe ser booleano')
];

const updateRoleValidator = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/)
        .withMessage('El nombre solo puede contener letras, números y espacios'),

    // ✅ Validar si lo envían al actualizar
    body('requires_cash_session')
        .optional()
        .isBoolean().withMessage('El campo requires_cash_session debe ser booleano')
];

const getRoleByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createRoleValidator,
    updateRoleValidator,
    getRoleByIdValidator
};
