// src/modules/tenant/tenant.validator.js
const { body, param } = require('express-validator');

const createTenantValidator = [
    // 🏢 Datos principales
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio'),

    body('description').optional().trim().escape(),

    // 🔗 URLs
    body('logo_url')
        .optional()
        .isURL()
        .withMessage('El logo debe ser una URL válida'),

    body('website')
        .optional()
        .isURL()
        .withMessage('El sitio web debe ser una URL válida'),

    // 📞 Contacto
    body('contact_name').optional().trim(),
    body('contact_email')
        .optional()
        .isEmail()
        .withMessage('El correo de contacto debe ser válido'),
    body('contact_phone')
        .optional()
        .isMobilePhone('es-MX')
        .withMessage('Debe ser un número de teléfono válido en MX'),

    // 🏠 Dirección
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country').optional().trim(),
    body('postal_code').optional().trim(),

    // 🧾 Datos fiscales
    body('tax_id')
        .optional()
        .trim()
        .isLength({ min: 12, max: 13 })
        .withMessage('El RFC debe tener entre 12 y 13 caracteres'),
    body('legal_name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('La razón social no puede estar vacía'),
    body('regime').optional().trim(),
    body('certificate_path').optional().isString(),
    body('key_path').optional().isString(),
    body('certificate_password').optional().isString(),

    // ⚙️ Configuración general
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('El estado debe ser active, inactive o suspended'),

    body('subscription_plan').optional().trim(),

    body('expires_at')
        .optional()
        .isDate()
        .withMessage('Debe ser una fecha válida (YYYY-MM-DD)')
        .custom(value => {
            if (new Date(value) < new Date()) {
                throw new Error('La fecha de expiración debe ser futura');
            }
            return true;
        }),

    // 🌎 Configuración regional y monetaria
    body('timezone')
        .optional()
        .isString()
        .withMessage('El timezone debe ser texto (ej. America/Hermosillo)'),

    body('opening_hours')
        .optional()
        .isObject()
        .withMessage('El horario de apertura debe ser un objeto JSON válido'),

    body('currency')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('La moneda debe tener el formato ISO-4217 (ej. MXN, USD)'),

    body('exchange_rate')
        .optional()
        .isDecimal({ decimal_digits: '0,4' })
        .withMessage('El tipo de cambio debe ser un número decimal con hasta 4 decimales'),
];

// 🟡 Actualización de Tenant
const updateTenantValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
    ...createTenantValidator.filter(v => !['name'].includes(v.builder?.fields?.[0])),
];

// 🔍 Obtener Tenant por ID
const getTenantByIdValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createTenantValidator,
    updateTenantValidator,
    getTenantByIdValidator,
};
