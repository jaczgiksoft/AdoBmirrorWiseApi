const { body, param } = require('express-validator');

const createBudgetValidator = [
    body('patient_id')
        .isInt().withMessage('El ID del paciente es obligatorio'),

    body('title')
        .trim()
        .notEmpty().withMessage('El título es obligatorio'),

    body('items')
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem'),

    body('items.*.description')
        .notEmpty().withMessage('La descripción del ítem es obligatoria'),

    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),

    body('items.*.unit_price')
        .isDecimal().withMessage('El precio unitario debe ser válido'),
];

const updateBudgetValidator = [
    param('id').isInt().withMessage('ID inválido'),

    body('title')
        .optional()
        .trim()
        .notEmpty(),

    body('items')
        .optional()
        .isArray(),
];

const getByPatientValidator = [
    param('patientId').isInt().withMessage('ID de paciente inválido')
];

module.exports = {
    createBudgetValidator,
    updateBudgetValidator,
    getByPatientValidator
};
