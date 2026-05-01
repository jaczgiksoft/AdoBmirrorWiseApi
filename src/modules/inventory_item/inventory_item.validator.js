const { body, param } = require('express-validator');

const createItemValidator = [
    body('name').notEmpty().withMessage('El nombre es requerido').isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('sku').optional({ values: 'falsy' }).isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('category').optional({ values: 'falsy' }).isLength({ max: 100 }),
    body('unit').optional({ values: 'falsy' }).isLength({ max: 50 }),
    body('description').optional({ values: 'falsy' }),
    body('min_stock').optional({ values: 'falsy' }).isInt({ min: 0 }),
    body('current_stock').optional({ values: 'falsy' }).isInt({ min: 0 }),
    body('purchase_price').optional({ values: 'falsy' }).isNumeric(),
    body('sale_price').optional({ values: 'falsy' }).isNumeric(),
    body('lot_number').optional({ values: 'falsy' }).isLength({ max: 100 }),
    body('expiry_date').optional({ values: 'falsy' }).isISO8601().toDate(),
    body('provider_id').optional({ values: 'falsy' }).isInt(),
    body('image').optional()
];

const updateItemValidator = [
    param('id').isInt().withMessage('ID inválido'),
    body('name').optional().notEmpty().withMessage('El nombre es requerido').isLength({ max: 150 }),
    body('sku').optional({ values: 'falsy' }).isLength({ max: 50 }),
    body('category').optional({ values: 'falsy' }).isLength({ max: 100 }),
    body('unit').optional({ values: 'falsy' }).isLength({ max: 50 }),
    body('description').optional({ values: 'falsy' }),
    body('min_stock').optional({ values: 'falsy' }).isInt({ min: 0 }),
    body('current_stock').optional({ values: 'falsy' }).isInt({ min: 0 }),
    body('purchase_price').optional({ values: 'falsy' }).isNumeric(),
    body('sale_price').optional({ values: 'falsy' }).isNumeric(),
    body('lot_number').optional({ values: 'falsy' }).isLength({ max: 100 }),
    body('expiry_date').optional({ values: 'falsy' }).isISO8601().toDate(),
    body('provider_id').optional({ values: 'falsy', nullable: true }).isInt(),
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
