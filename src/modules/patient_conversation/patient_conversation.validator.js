const { body, param } = require('express-validator');

// 🟢 Crear conversación de paciente
const createPatientConversationValidator = [
    // 🏢 Multi-tenant
    body('tenant_id')
        .isInt().withMessage('El tenant_id debe ser un número entero'),

    // 👤 Paciente asociado
    body('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),

    // 🧑‍⚕️ Usuario autor
    body('user_id')
        .isInt().withMessage('El user_id debe ser un número entero'),

    // 💬 Título
    body('title')
        .trim()
        .notEmpty().withMessage('El título de la conversación es obligatorio')
        .isLength({ max: 150 }).withMessage('El título no puede exceder 150 caracteres'),

    // 🗒️ Contenido
    body('content')
        .trim()
        .notEmpty().withMessage('El contenido de la conversación es obligatorio')
        .isLength({ max: 10000 }).withMessage('El contenido no puede exceder 10,000 caracteres'),
];

// 🟡 Actualizar conversación
const updatePatientConversationValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),

    ...createPatientConversationValidator.map(v => {
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener conversación por ID
const getPatientConversationByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

// 📋 Obtener conversaciones por paciente
const getConversationsByPatientIdValidator = [
    param('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),
];

module.exports = {
    createPatientConversationValidator,
    updatePatientConversationValidator,
    getPatientConversationByIdValidator,
    getConversationsByPatientIdValidator,
};
