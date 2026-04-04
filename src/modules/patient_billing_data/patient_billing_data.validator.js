const { body, param } = require('express-validator');

const addValidator = [
    body('patient_id').isInt().withMessage('patient_id inválido'),
    body('billing_data_id').isInt().withMessage('billing_data_id inválido')
];

const linkOrCreateValidator = [
    body('patient_id').isInt().withMessage('patient_id debe ser un número entero'),
    body('business_name').trim().notEmpty().withMessage('El nombre o razón social es obligatorio').isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('rfc').trim().notEmpty().withMessage('El RFC es obligatorio').isLength({ min: 12, max: 20 }).withMessage('RFC debe tener entre 12 y 20 caracteres'),
    body('tax_regime').trim().notEmpty().withMessage('El régimen fiscal es obligatorio'),
    body('zip_code').trim().notEmpty().withMessage('El código postal es obligatorio').isLength({ min: 4, max: 10 }).withMessage('Código postal inválido'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Formato de correo inválido'),
    body('is_primary').optional().isBoolean().withMessage('is_primary debe ser booleano')
];

const updateLinkOrCreateValidator = [
    param('id').isInt().withMessage('ID de relación inválido'),
    body('business_name').trim().notEmpty().withMessage('El nombre o razón social es obligatorio').isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('rfc').trim().notEmpty().withMessage('El RFC es obligatorio').isLength({ min: 12, max: 20 }).withMessage('RFC debe tener entre 12 y 20 caracteres'),
    body('tax_regime').trim().notEmpty().withMessage('El régimen fiscal es obligatorio'),
    body('zip_code').trim().notEmpty().withMessage('El código postal es obligatorio').isLength({ min: 4, max: 10 }).withMessage('Código postal inválido'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Formato de correo inválido'),
    body('is_primary').optional().isBoolean().withMessage('is_primary debe ser booleano')
];

const idValidator = [
    param('id').isInt().withMessage('ID inválido')
];

const patientIdValidator = [
    param('patient_id').isInt().withMessage('ID de paciente inválido')
];

module.exports = {
    addValidator,
    linkOrCreateValidator,
    updateLinkOrCreateValidator,
    idValidator,
    patientIdValidator
};
