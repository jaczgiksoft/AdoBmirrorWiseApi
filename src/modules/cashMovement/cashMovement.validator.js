const { body, param } = require('express-validator');

const createMovementValidator = [
    body('cash_session_id')
        .notEmpty().withMessage('La sesión de caja es obligatoria')
        .isInt().withMessage('El ID de sesión debe ser un número válido'),

    body('cash_register_id')
        .notEmpty().withMessage('La caja registradora es obligatoria')
        .isInt().withMessage('El ID de la caja debe ser un número válido'),

    body('type')
        .notEmpty().withMessage('El tipo de movimiento es obligatorio')
        .isIn(['inflow', 'outflow']).withMessage('El tipo debe ser inflow o outflow'),

    body('amount')
        .notEmpty().withMessage('El monto es obligatorio')
        .isFloat({ gt: 0 }).withMessage('El monto debe ser un número mayor a 0'),
    // 👆 Acepta cualquier número con decimales, mayor a 0.
    // La DB (DECIMAL(12,2)) será la que limite a 2 decimales.

    body('concept')
        .trim()
        .notEmpty().withMessage('El concepto es obligatorio'),

    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser texto')
];

const getMovementByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createMovementValidator,
    getMovementByIdValidator
};
