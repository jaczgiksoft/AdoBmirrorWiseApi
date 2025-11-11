const { body, param } = require('express-validator');

// ===========================
// 🧩 CREATE PRODUCT VALIDATOR
// ===========================
const createProductValidator = [
    // 🔑 Identificación
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio'),

    body('sku')
        .trim()
        .notEmpty()
        .withMessage('El SKU es obligatorio'),

    body('barcode')
        .optional({ nullable: true })
        .isLength({ min: 8 })
        .withMessage('El código de barras debe tener al menos 8 caracteres'),

    // 📂 Clasificación
    body('department_store_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('El departamento/tienda debe ser un ID válido'),

    body('category_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('La categoría debe ser un ID válido'),

    body('brand_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('La marca debe ser un ID válido'),

    body('unit_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('La unidad debe ser un ID válido'),

    body('tax_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('El impuesto debe ser un ID válido'),

    // 💲 Configuración de precios
    body('profit_margin')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El margen de ganancia debe ser un número positivo'),

    body('promo_price')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('El precio promocional debe ser un número positivo'),

    body('is_tax_included')
        .optional()
        .isBoolean()
        .withMessage('El campo is_tax_included debe ser booleano'),

    // ⚙️ Inventario y control
    body('stock_control')
        .optional()
        .isBoolean()
        .withMessage('El campo stock_control debe ser booleano'),

    // 🧱 Empaques
    body('is_pack')
        .optional()
        .isBoolean()
        .withMessage('El campo is_pack debe ser booleano'),

    body('units_per_pack')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('La cantidad por paquete debe ser un número positivo'),

    // ⚖️ Granel
    body('is_bulk')
        .optional()
        .isBoolean()
        .withMessage('El campo is_bulk debe ser booleano'),

    body('unit_base_name')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20 })
        .withMessage('El nombre de unidad base no debe superar los 20 caracteres'),

    body('unit_purchase_name')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20 })
        .withMessage('El nombre de unidad de compra no debe superar los 20 caracteres'),

    // 🔐 Estado
    body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Estado inválido'),
];

// ===========================
// ✏️ UPDATE PRODUCT VALIDATOR
// ===========================
const updateProductValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createProductValidator,
];

// ===========================
// 🔍 GET PRODUCT BY ID VALIDATOR
// ===========================
const getProductByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createProductValidator,
    updateProductValidator,
    getProductByIdValidator,
};
