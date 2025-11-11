const { body, param } = require('express-validator');

const createCashRegisterValidator = [
    body('store_id').notEmpty().isInt().withMessage('La tienda es obligatoria'),
    body('code').notEmpty().trim().withMessage('El código es obligatorio'),
    body('name').notEmpty().trim().withMessage('El nombre es obligatorio'),
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('is_main').optional().isBoolean()
];

const updateCashRegisterValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('code').optional().trim(),
    body('name').optional().trim(),
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('is_main').optional().isBoolean()
];

const getCashRegisterByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createCashRegisterValidator,
    updateCashRegisterValidator,
    getCashRegisterByIdValidator
};
