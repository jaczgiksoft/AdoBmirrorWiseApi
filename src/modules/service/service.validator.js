const { body, param } = require('express-validator');

// 🟢 Creación de Servicio
const createServiceValidator = [
    // 📢 Detalles del servicio
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del servicio es obligatorio')
        .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),

    body('description')
        .optional()
        .trim(),

    body('duration_minutes')
        .isInt({ gt: 0 }).withMessage('La duración debe ser un entero mayor a 0'),

    body('suggested_units')
        .optional()
        .isInt({ gt: 0 }).withMessage('Las unidades sugeridas deben ser mayor a 0'),

    body('unit_value')
        .optional()
        .isInt({ gt: 0 }).withMessage('El valor unitario debe ser mayor a 0'),

    body('price')
        .isDecimal().withMessage('El precio debe ser un valor decimal válido'),

    body('requires_inventory')
        .optional()
        .isBoolean().withMessage('requires_inventory debe ser booleano'),

    body('deductible')
        .optional()
        .isBoolean().withMessage('deductible debe ser booleano'),

    body('color')
        .optional()
        .isHexColor().withMessage('El color debe ser un código hexadecimal válido (ej. #FFFFFF)'),

    body('sat_code')
        .optional()
        .isLength({ max: 10 }).withMessage('El código SAT no puede exceder 10 caracteres'),

    body('cfdi_usage')
        .optional()
        .isLength({ max: 5 }).withMessage('El uso CFDI no puede exceder 5 caracteres'),
];

// 🟡 Actualización de Servicio
const updateServiceValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
    ...createServiceValidator.map(v => {
        // convierte todos los campos en opcionales en actualización
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener Servicio por ID
const getServiceByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createServiceValidator,
    updateServiceValidator,
    getServiceByIdValidator,
};
