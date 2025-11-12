const { body, param } = require('express-validator');

// 🟢 Crear pasatiempo de paciente
const createPatientHobbyValidator = [
    // 🏢 Multi-tenant
    body('tenant_id')
        .isInt().withMessage('El tenant_id debe ser un número entero'),

    // 👤 Paciente asociado
    body('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),

    // 🎯 Nombre del pasatiempo
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del pasatiempo es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
];

// 🟡 Actualizar pasatiempo
const updatePatientHobbyValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
    ...createPatientHobbyValidator.map(v => {
        // Hace que los campos sean opcionales durante actualización
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener pasatiempo por ID
const getPatientHobbyByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

// 📋 Obtener todos los pasatiempos de un paciente
const getHobbiesByPatientIdValidator = [
    param('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),
];

module.exports = {
    createPatientHobbyValidator,
    updatePatientHobbyValidator,
    getPatientHobbyByIdValidator,
    getHobbiesByPatientIdValidator,
};
