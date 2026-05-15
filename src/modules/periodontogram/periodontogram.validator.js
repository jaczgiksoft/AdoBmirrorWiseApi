// src/modules/periodontogram/periodontogram.validator.js
const { body, param } = require('express-validator');

const validateGetByPatient = [
    param('patientId')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt().withMessage('El ID del paciente debe ser un número entero')
];

const validateUpsert = [
    body('patientId')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt().withMessage('El ID del paciente debe ser un número entero'),
    body('teeth_data')
        .notEmpty().withMessage('Los datos de los dientes son requeridos')
        .isObject().withMessage('Los datos de los dientes deben ser un objeto válido'),
    body('exam_date')
        .optional()
        .isISO8601().withMessage('La fecha del examen debe ser válida')
];

const validateDelete = [
    param('id')
        .notEmpty().withMessage('El ID del registro es requerido')
        .isInt().withMessage('El ID del registro debe ser un número entero')
];

module.exports = {
    validateGetByPatient,
    validateUpsert,
    validateDelete
};
