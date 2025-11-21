const { body, param } = require('express-validator');

const addValidator = [
    body('patient_id').isInt().withMessage('patient_id inválido'),
    body('representative_id').isInt().withMessage('representative_id inválido')
];

const idValidator = [
    param('id').isInt().withMessage('ID inválido')
];

const patientIdValidator = [
    param('patient_id').isInt().withMessage('ID de paciente inválido')
];

module.exports = {
    addValidator,
    idValidator,
    patientIdValidator
};
