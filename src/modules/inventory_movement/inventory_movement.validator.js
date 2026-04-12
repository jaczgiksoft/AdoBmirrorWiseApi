const { body } = require('express-validator');

const createMovementValidator = [
    body('item_id').isInt().withMessage('ID de artículo inválido'),
    body('type').notEmpty().withMessage('El tipo de movimiento es requerido').isLength({ max: 50 }),
    body('quantity').isInt().withMessage('La cantidad debe ser un número entero diferente de cero').custom(value => value !== 0).withMessage('La cantidad no puede ser cero'),
    body('unit_price').optional().isNumeric(),
    body('reason').optional().isLength({ max: 255 }),
    body('reference').optional().isLength({ max: 150 }),
    body('provider_id').optional({ nullable: true }).isInt()
];

module.exports = {
    createMovementValidator
};
