const { body, param } = require('express-validator');

// 🟢 Crear prescripción de paciente
const createPatientPrescriptionValidator = [
    // 🏢 Multi-tenant
    body('tenant_id')
        .isInt().withMessage('El tenant_id debe ser un número entero'),

    // 👤 Paciente asociado
    body('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),

    // 🎯 Título de la prescripción
    body('title')
        .trim()
        .notEmpty().withMessage('El título de la prescripción es obligatorio')
        .isLength({ max: 150 }).withMessage('El título no puede exceder 150 caracteres'),

    // 📝 Contenido de la prescripción
    body('content')
        .trim()
        .notEmpty().withMessage('El contenido de la prescripción es obligatorio')
        .isLength({ max: 5000 }).withMessage('El contenido no puede exceder 5000 caracteres'),
];

// 🟡 Actualizar prescripción
const updatePatientPrescriptionValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
    ...createPatientPrescriptionValidator.map(v => {
        // Hace que los campos sean opcionales durante actualización
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener prescripción por ID
const getPatientPrescriptionByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

// 📋 Obtener todas las prescripciones de un paciente
const getPrescriptionsByPatientIdValidator = [
    param('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),
];

module.exports = {
    createPatientPrescriptionValidator,
    updatePatientPrescriptionValidator,
    getPatientPrescriptionByIdValidator,
    getPrescriptionsByPatientIdValidator,
};
