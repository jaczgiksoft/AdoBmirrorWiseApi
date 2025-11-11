// src/modules/supplier/supplier.validator.js
const { body, param } = require('express-validator');

const createSupplierValidator = [
    // 🏷️ Datos básicos
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del proveedor es obligatorio'),

    body('contact_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre de contacto no puede exceder 100 caracteres'),

    // 📞 Contacto
    body('email')
        .optional()
        .isEmail()
        .withMessage('El correo electrónico debe ser válido'),
    body('phone')
        .optional()
        .isMobilePhone('es-MX')
        .withMessage('Debe ser un número de teléfono válido de México'),

    // 📍 Dirección
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country').optional().trim(),
    body('postal_code')
        .optional()
        .isLength({ min: 4, max: 10 })
        .withMessage('El código postal debe tener entre 4 y 10 caracteres'),

    // 💼 Datos fiscales
    body('tax_id')
        .optional()
        .isLength({ min: 12, max: 13 })
        .withMessage('El RFC debe tener entre 12 y 13 caracteres'),

    // 🌐 Información adicional
    body('website')
        .optional()
        .isURL()
        .withMessage('Debe ser una URL válida (http o https)'),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres'),

    // ⚪ Estado
    body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('El estado debe ser active o inactive'),
];

const updateSupplierValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
    ...createSupplierValidator,
];

const getSupplierByIdValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createSupplierValidator,
    updateSupplierValidator,
    getSupplierByIdValidator,
};
