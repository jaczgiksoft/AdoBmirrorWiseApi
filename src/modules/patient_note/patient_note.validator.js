const { body, param } = require('express-validator');

// 🟢 Crear nota de paciente
const createPatientNoteValidator = [
    // 🏢 Multi-tenant
    body('tenant_id')
        .isInt().withMessage('El tenant_id debe ser un número entero'),

    // 👤 Paciente asociado
    body('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),

    // ✍️ Usuario autor
    body('user_id')
        .isInt().withMessage('El user_id debe ser un número entero'),

    // 📝 Título y contenido
    body('title')
        .trim()
        .notEmpty().withMessage('El título es obligatorio')
        .isLength({ max: 150 }).withMessage('El título no puede exceder 150 caracteres'),

    body('content')
        .trim()
        .notEmpty().withMessage('El contenido de la nota es obligatorio')
        .isLength({ max: 10000 }).withMessage('El contenido no puede exceder 10,000 caracteres'),

    // 🔒 Privacidad
    body('is_private')
        .optional()
        .isBoolean().withMessage('El campo is_private debe ser booleano'),
];

// 🟡 Actualizar nota existente
const updatePatientNoteValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),

    ...createPatientNoteValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener nota por ID
const getPatientNoteByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

// 📋 Obtener notas por paciente
const getNotesByPatientIdValidator = [
    param('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),
];

module.exports = {
    createPatientNoteValidator,
    updatePatientNoteValidator,
    getPatientNoteByIdValidator,
    getNotesByPatientIdValidator,
};
