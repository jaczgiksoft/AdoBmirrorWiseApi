const { body, param } = require('express-validator');

const createItemValidator = [
    body('name').notEmpty().withMessage('El nombre es requerido').isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('sku').optional().isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('category').optional().isLength({ max: 100 }),
    body('unit').optional().isLength({ max: 50 }),
    body('description').optional(),
    body('min_stock').optional().isInt({ min: 0 }),
    body('current_stock').optional().isInt({ min: 0 }),
    body('purchase_price').optional().isNumeric(),
    body('sale_price').optional().isNumeric(),
    body('lot_number').optional().isLength({ max: 100 }),
    body('expiry_date').optional().isISO8601().toDate(),
    body('provider_id').optional().isInt(),
    body('image').optional()
];

const updateItemValidator = [
    param('id').isInt().withMessage('ID inválido'),
    body('name').optional().notEmpty().withMessage('El nombre es requerido').isLength({ max: 150 }),
    body('sku').optional().isLength({ max: 50 }),
    body('category').optional().isLength({ max: 100 }),
    body('unit').optional().isLength({ max: 50 }),
    body('description').optional(),
    body('min_stock').optional().isInt({ min: 0 }),
    body('current_stock').optional().isInt({ min: 0 }),
    body('purchase_price').optional().isNumeric(),
    body('sale_price').optional().isNumeric(),
    body('lot_number').optional().isLength({ max: 100 }),
    body('expiry_date').optional().isISO8601().toDate(),
    body('provider_id').optional({ nullable: true }).isInt(),
    body('image').optional()
];

const getItemByIdValidator = [
    param('id').isInt().withMessage('ID inválido')
];

module.exports = {
    createItemValidator,
    updateItemValidator,
    getItemByIdValidator
};
