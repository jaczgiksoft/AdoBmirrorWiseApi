// src/modules/patient_clinical/patient_clinical.validator.js
const { body, param } = require('express-validator');

const validateGetByPatient = [
    param('patientId').isInt().withMessage('ID de paciente inválido')
];

const validateUpsert = [
    body('patientId').isInt().withMessage('ID de paciente requerido'),
    body('clinicalData').isObject().withMessage('Datos clínicos deben ser un objeto')
];

module.exports = {
    validateGetByPatient,
    validateUpsert
};
