// src/modules/odontogram/odontogram.validator.js
const { body, param } = require('express-validator');

const validateGetByPatient = [
    param('patientId').isInt().withMessage('ID de paciente inválido')
];

const validateSave = [
    body('patientId').isInt().withMessage('ID de paciente requerido'),
    body('toothStates').optional().isObject(),
    body('brackets').optional().isObject(),
    body('bracketWires').optional().isObject(),
    body('tads').optional().isObject(),
    body('tadWires').optional().isObject(),
    body('surfaceStates').optional().isObject(),
    body('periodontalData').optional().isObject(),
    body('toothNotes').optional().isObject()
];

module.exports = {
    validateGetByPatient,
    validateSave
};
