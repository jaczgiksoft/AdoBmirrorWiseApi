const { body, param } = require('express-validator');

// 🧩 Creación de Paciente
const createPatientValidator = [
    // 🏢 Multi-tenant
    body('tenant_id')
        .isInt().withMessage('El tenant_id debe ser un número entero'),

    // 🆔 Identificadores
    body('medical_record_number')
        .trim()
        .notEmpty().withMessage('El número de expediente es obligatorio')
        .isLength({ max: 50 }).withMessage('El número de expediente no puede exceder 50 caracteres'),

    body('family_code')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('El código familiar no puede exceder 50 caracteres'),

    // 👤 Identidad
    body('first_name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('last_name')
        .trim()
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),

    body('middle_name').optional().trim(),
    body('nickname').optional().trim(),

    // 🧬 Información personal
    body('genre')
        .notEmpty().withMessage('El género es obligatorio')
        .isIn(['male', 'female', 'other']).withMessage('El género debe ser male, female u other'),

    body('birth_date')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isDate().withMessage('La fecha de nacimiento debe tener formato YYYY-MM-DD'),

    body('marital_status').optional().trim(),

    // ☎️ Contacto
    body('phone_number')
        .notEmpty().withMessage('El número de teléfono es obligatorio')
        .isString().isLength({ min: 8, max: 20 }).withMessage('Debe ser un teléfono válido'),

    body('email')
        .optional({ values: 'falsy' })
        .isEmail().withMessage('El correo debe tener un formato válido'),

    // 🔗 Relaciones externas (FK)
    body('referral_id').optional().isInt().withMessage('referral_id debe ser un número entero'),
    body('occupation_id').optional().isInt().withMessage('occupation_id debe ser un número entero'),
    body('patient_profession_id').optional().isInt().withMessage('patient_profession_id debe ser un número entero'),
    body('bracket_type_id').optional().isInt().withMessage('bracket_type_id debe ser un número entero'),

    // 🔁 Tipos de paciente (N:M)
    body('patient_type_ids')
        .optional()
        .isArray().withMessage('patient_type_ids debe ser un arreglo de IDs de tipo de paciente'),
    body('patient_type_ids.*')
        .isInt().withMessage('Cada ID en patient_type_ids debe ser un número entero'),

    body('patient_status_id').optional().isInt().withMessage('patient_status_id debe ser un número entero'),

    // 🏠 Dirección
    body('address_street_name').optional().trim(),
    body('address_neighborhood').optional().trim(),
    body('address_apartment_number').optional().trim(),
    body('address_street_number').optional().trim(),
    body('address_zip_code').optional().trim(),
    body('address_city').optional().trim(),
    body('address_state').optional().trim(),
    body('address_country').optional().trim(),

    // 💼 Empresa
    body('rfc')
        .optional()
        .trim()
        .isLength({ min: 12, max: 13 }).withMessage('El RFC debe tener entre 12 y 13 caracteres'),
    body('company').optional().trim(),
    body('company_address').optional().trim(),

    // 🖼️ Imágenes
    body('photo_url').optional().isURL().withMessage('La foto debe ser una URL válida'),
    body('medical_record_image_url').optional().isURL().withMessage('El archivo del expediente debe ser una URL válida'),

    // 💊 Tratamientos
    body('is_under_medical_treatment').optional().isBoolean(),
    body('is_taking_medication').optional().isBoolean(),
    body('is_allergic_to_medication').optional().isBoolean(),

    // ⚕️ Condiciones médicas
    body('has_hepatitis').optional().isBoolean(),
    body('has_diabetes').optional().isBoolean(),
    body('has_lung_conditions').optional().isBoolean(),
    body('has_migraines').optional().isBoolean(),
    body('has_amigdalitis').optional().isBoolean(),
    body('has_adenoiditis').optional().isBoolean(),
    body('has_epilepsy').optional().isBoolean(),
    body('has_rheumatic_fever').optional().isBoolean(),
    body('has_psychological_conditions').optional().isBoolean(),
    body('has_heart_conditions').optional().isBoolean(),
    body('has_hemophilia').optional().isBoolean(),
    body('has_stds').optional().isBoolean(),

    // 🤰 Embarazo
    body('is_pregnant').optional().isBoolean(),
    body('pregnancy_weeks').optional().isInt({ min: 0, max: 45 }).withMessage('Las semanas de embarazo deben estar entre 0 y 45'),

    // 🗓️ Fechas clínicas
    body('last_radiograph_date').optional().isDate().withMessage('Debe ser una fecha válida (YYYY-MM-DD)'),
    body('last_dental_exam_date').optional().isDate().withMessage('Debe ser una fecha válida (YYYY-MM-DD)'),

    // 🔐 Portal del paciente
    body('push_token').optional().isString()
];

// 🟡 Actualización de Paciente
const updatePatientValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    ...createPatientValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    })
];

// 🧩 Actualización de Información General (Paso 1)
const updatePatientGeneralValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('medical_record_number').optional().trim().isLength({ max: 50 }),
    body('family_code').optional().trim().isLength({ max: 50 }),
    body('first_name').optional().trim().isLength({ min: 2, max: 100 }),
    body('last_name').optional().trim().isLength({ min: 2, max: 100 }),
    body('middle_name').optional().trim(),
    body('nickname').optional().trim(),
    body('genre').optional().isIn(['male', 'female', 'other']),
    body('birth_date').optional().isDate(),
    body('marital_status').optional().trim(),
    body('phone_number').optional().isString().isLength({ min: 8, max: 20 }),
    body('email').optional({ values: 'falsy' }).isEmail(),
    body('referral_id').optional().isInt(),
    body('address_street_name').optional().trim(),
    body('address_street_number').optional().trim(),
    body('address_apartment_number').optional().trim(),
    body('address_neighborhood').optional().trim(),
    body('address_zip_code').optional().trim(),
    body('address_city').optional().trim(),
    body('address_state').optional().trim(),
    body('address_country').optional().trim(),
];

// 🔍 Obtener Paciente por ID
const getPatientByIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createPatientValidator,
    updatePatientValidator,
    updatePatientGeneralValidator,
    getPatientByIdValidator,
};
