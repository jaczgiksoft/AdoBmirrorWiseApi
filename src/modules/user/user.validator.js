const { body, param } = require('express-validator');

const createUserValidator = [
    body('username').trim().notEmpty().withMessage('El nombre de usuario es obligatorio'),

    body('email')
        .trim()
        .notEmpty().withMessage('El correo es obligatorio')
        .isEmail().withMessage('El correo debe tener un formato válido'),

    body('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),

    body('role_id')
        .notEmpty().withMessage('El rol es obligatorio')
        .isInt().withMessage('El rol debe ser un número válido'),

    body('store_id').optional().isInt().withMessage('La tienda debe ser un número válido'),
    body('current_session_id').optional().isInt().withMessage('La sesión debe ser un número válido'),

    body('first_name').optional().isString().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('last_name').optional().isString().notEmpty().withMessage('El apellido no puede estar vacío'),
    body('phone').optional().isMobilePhone('es-MX').withMessage('Debe ser un número de teléfono válido en MX'),
    body('status').optional().isIn(['active', 'inactive', 'blocked']).withMessage('Estado inválido'),
    body('is_superadmin').optional().isBoolean().withMessage('Debe ser booleano')
];

const updateUserValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),

    body('username').optional().trim().notEmpty().withMessage('El nombre de usuario no puede estar vacío'),
    body('email').optional().isEmail().withMessage('El correo debe tener un formato válido'),
    body('password')
        .optional()
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('role_id').optional().isInt().withMessage('El rol debe ser un número'),

    body('store_id').optional().isInt().withMessage('La tienda debe ser un número válido'),
    body('current_session_id').optional().isInt().withMessage('La sesión debe ser un número válido'),

    body('first_name').optional().isString().notEmpty(),
    body('last_name').optional().isString().notEmpty(),
    body('phone').optional().isMobilePhone('es-MX'),
    body('status').optional().isIn(['active', 'inactive', 'blocked']),
    body('is_superadmin').optional().isBoolean()
];

const getUserByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createUserValidator,
    updateUserValidator,
    getUserByIdValidator
};
