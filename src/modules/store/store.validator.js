// src/modules/store/store.validator.js
const { body, param } = require('express-validator');

const createStoreValidator = [
    // 📛 Datos principales
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('El código es obligatorio')
        .isLength({ max: 20 })
        .withMessage('El código no debe exceder 20 caracteres'),

    // 🖼️ Archivos de imagen (logo / banner)
    body('logo')
        .custom((value, { req }) => {
            if (req.files?.logo?.length > 0) {
                const file = req.files.logo[0];
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error('El logo debe ser una imagen válida (JPG, PNG o WEBP)');
                }
            }
            return true;
        })
        .optional(),

    body('banner')
        .custom((value, { req }) => {
            if (req.files?.banner?.length > 0) {
                const file = req.files.banner[0];
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error('El banner debe ser una imagen válida (JPG, PNG o WEBP)');
                }
            }
            return true;
        })
        .optional(),

    // 📞 Contacto / ubicación
    body('email')
        .optional()
        .isEmail()
        .withMessage('El correo debe ser válido'),
    body('phone')
        .optional()
        .isString()
        .isLength({ min: 7, max: 20 })
        .withMessage('El teléfono debe tener entre 7 y 20 caracteres'),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country').optional().trim(),
    body('postal_code').optional().trim(),

    // 🧾 Datos fiscales
    body('tax_id')
        .optional()
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

    // ⚙️ Configuración POS
    body('timezone')
        .optional()
        .isString()
        .withMessage('El timezone debe ser texto (ej. America/Hermosillo)'),
    body('opening_hours')
        .optional()
        .custom((value) => {
            try {
                if (typeof value === 'string') JSON.parse(value); // permitir JSON como string
                return true;
            } catch {
                throw new Error('El horario de apertura debe ser JSON válido o texto vacío');
            }
        }),
    body('currency')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('La moneda debe tener el formato ISO-4217 (ej. MXN, USD)'),
    body('exchange_rate')
        .optional()
        .isDecimal({ decimal_digits: '0,4' })
        .withMessage('El tipo de cambio debe ser un número decimal con hasta 4 decimales'),

    // 💰 Margen de ganancia local
    body('profit_margin')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El margen de ganancia debe ser un número entre 0 y 100'),

    // 🧩 Herencia
    body('use_parent_config')
        .optional()
        .isBoolean()
        .withMessage('El campo use_parent_config debe ser booleano'),
    body('use_parent_tax_data')
        .optional()
        .isBoolean()
        .withMessage('El campo use_parent_tax_data debe ser booleano'),

    // ⚪ Estado
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('El estado debe ser active, inactive o suspended'),
];

const updateStoreValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createStoreValidator,
];

const getStoreByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createStoreValidator,
    updateStoreValidator,
    getStoreByIdValidator,
};
