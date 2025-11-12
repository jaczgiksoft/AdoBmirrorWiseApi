const { body, param } = require('express-validator');

// 🟢 Creación de Alerta de Paciente
const createPatientAlertValidator = [
    // 🏢 Multi-tenant
    body('tenant_id')
        .isInt().withMessage('El tenant_id debe ser un número entero'),

    // 👤 Paciente asociado
    body('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),

    // 📢 Detalles de la alerta
    body('title')
        .trim()
        .notEmpty().withMessage('El título de la alerta es obligatorio')
        .isLength({ max: 150 }).withMessage('El título no puede exceder 150 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('La descripción no puede exceder 5000 caracteres'),

    // ⚙️ Tipo de alerta
    body('is_admin_alert')
        .optional()
        .isBoolean().withMessage('El campo is_admin_alert debe ser booleano'),
];

// 🟡 Actualización de Alerta
const updatePatientAlertValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
    ...createPatientAlertValidator.map(v => {
        // convierte todos los campos en opcionales en actualización
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener Alerta por ID
const getPatientAlertByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createPatientAlertValidator,
    updatePatientAlertValidator,
    getPatientAlertByIdValidator,
};
