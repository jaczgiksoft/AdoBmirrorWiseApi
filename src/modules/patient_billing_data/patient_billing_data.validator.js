const { body, param } = require('express-validator');

const addValidator = [
    body('patient_id').isInt().withMessage('patient_id inválido'),
    body('billing_data_id').isInt().withMessage('billing_data_id inválido')
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
