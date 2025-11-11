const { body, param } = require('express-validator');

const openSessionValidator = [
    body('cash_register_id')
        .isInt()
        .withMessage('La caja es obligatoria'),

    body('opening_balance')
        .isFloat({ min: 0 })
        .withMessage('El saldo inicial debe ser numérico y mayor o igual a 0'),

    body('notes')
        .optional({ nullable: true }) // ✅ ahora permite null o undefined
        .isString()
        .withMessage('Las notas deben ser texto si se incluyen')
];

const closeSessionValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),

    body('closing_balance')
        .isFloat()
        .withMessage('El saldo final es obligatorio y debe ser numérico'),

    body('notes')
        .optional({ nullable: true }) // ✅ permite null
        .isString()
        .withMessage('Las notas deben ser texto si se incluyen')
];

module.exports = { openSessionValidator, closeSessionValidator };
