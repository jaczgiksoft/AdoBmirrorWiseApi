// src/modules/inventoryMovement/inventoryMovement.validator.js
const { body, param } = require('express-validator');

const createInventoryMovementValidator = [
    body('store_id').isInt().withMessage('store_id debe ser entero'),
    body('product_id').isInt().withMessage('product_id debe ser entero'),
    body('type').isIn(['in', 'out', 'adjustment']).withMessage('Tipo inválido'),
    body('quantity').isDecimal().withMessage('Cantidad debe ser decimal'),
    body('reason').isIn(['purchase', 'sale', 'transfer', 'loss', 'manual']).withMessage('Razón inválida'),
    body('notes').optional().isString(),
    body('reference_type').optional().isString(),
    body('reference_id').optional().isInt()
];

const getMovementByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    createInventoryMovementValidator,
    getMovementByIdValidator
};
