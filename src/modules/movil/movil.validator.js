const { query } = require('express-validator');

// 🔍 Historial clínico de paciente (Mobile)
const getPatientClinicalHistoryMobileValidator = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('limit debe ser un entero entre 1 y 50'),

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page debe ser un entero positivo'),

    query('current_appointment_id')
        .optional()
        .isInt().withMessage('current_appointment_id debe ser un entero'),

    query('exclude_appointment_id')
        .optional()
        .isInt().withMessage('exclude_appointment_id debe ser un entero'),

    query('exclude_current')
        .optional()
        .isBoolean().withMessage('exclude_current debe ser booleano'),

    query('status')
        .optional()
        .isString().withMessage('status debe ser un string'),
];

module.exports = {
    getPatientClinicalHistoryMobileValidator
};
