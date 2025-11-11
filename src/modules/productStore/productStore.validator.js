const { body, param } = require('express-validator');

// ================================
// 🟢 CREAR PRODUCT-STORE
// ================================
const createProductStoreValidator = [
    // 🧩 Relaciones base
    body('product_id')
        .isInt({ min: 1 })
        .withMessage('El campo product_id es obligatorio y debe ser un número entero'),

    body('store_id')
        .isInt({ min: 1 })
        .withMessage('El campo store_id es obligatorio y debe ser un número entero'),

    // 🧮 Inventario
    body('stock')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El stock debe ser un número mayor o igual a 0'),

    body('stock_min')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El stock mínimo debe ser un número mayor o igual a 0'),

    body('stock_max')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El stock máximo debe ser un número mayor o igual a 0'),

    body('stock_unit_name')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20 })
        .withMessage('La unidad de stock no debe exceder los 20 caracteres'),

    // 🛒 Último ingreso
    body('cost_last_purchase')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El costo de la última compra debe ser un número positivo'),

    body('last_restock_at')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de último reabastecimiento debe ser válida'),

    // 🔁 Reabastecimiento
    body('reorder_point')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El punto de reorden debe ser un número positivo'),

    body('reorder_qty')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('La cantidad de reabastecimiento debe ser un número positivo'),

    // 💰 Overrides de precios
    body('wholesale_price_override')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El precio mayorista debe ser un número positivo'),

    body('wholesale_min_qty_override')
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage('La cantidad mínima mayorista debe ser un número entero positivo'),

    body('promo_price_override')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El precio promocional debe ser un número positivo'),

    // 📊 Overrides de margen e impuestos
    body('profit_margin_override')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El margen de ganancia debe ser un número positivo'),

    body('tax_id_override')
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage('El impuesto personalizado debe ser un ID válido'),

    // 🖥️ Visibilidad
    body('visible_in_pos')
        .optional()
        .isBoolean()
        .withMessage('El campo visible_in_pos debe ser booleano'),

    // 🔐 Estado
    body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Estado inválido'),
];

// ================================
// ✏️ ACTUALIZAR PRODUCT-STORE
// ================================
const updateProductStoreValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
    ...createProductStoreValidator,
];

// ================================
// 🔍 OBTENER POR ID
// ================================
const getProductStoreByIdValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createProductStoreValidator,
    updateProductStoreValidator,
    getProductStoreByIdValidator,
};
