const { body, param } = require('express-validator');

const validateId = [
    param('id').isInt().withMessage('ID inválido')
];

const validateGetByPatient = [
    param('patientId').isInt().withMessage('ID de paciente inválido')
];

const validateSave = [
    body('patient_id').isInt().withMessage('ID de paciente requerido'),
    body('upper_elastic').optional().isString(),
    body('lower_elastic').optional().isString(),
    body('notes').optional().isString(),
    body('start_date').optional({ values: 'falsy' }).isISO8601().toDate(),
    body('end_date').optional({ values: 'falsy' }).isISO8601().toDate(),
    body('hours').optional().isString(),
    body('odontogram_data').optional().isObject()
];

module.exports = {
    validateGetByPatient,
    validateSave,
    validateId
};
