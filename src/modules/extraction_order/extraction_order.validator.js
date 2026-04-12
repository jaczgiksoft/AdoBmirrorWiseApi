// src/modules/extraction_order/extraction_order.validator.js
const { body } = require('express-validator');

/**
 * Validaciones para la creación de una orden de extracción
 */
const createExtractionOrderValidator = [
    body('patient_id')
        .notEmpty().withMessage('El ID del paciente es obligatorio')
        .isInt().withMessage('El ID del paciente debe ser un número entero'),
    
    body('doctor_id')
        .optional()
        .isInt().withMessage('El ID del doctor debe ser un número entero'),
    
    body('clinical_reason')
        .optional()
        .trim(),
    
    body('notes')
        .optional()
        .trim(),
    
    body('status')
        .optional()
        .isIn(['pending', 'completed']).withMessage('Estado de orden inválido'),
    
    body('order_date')
        .notEmpty().withMessage('La fecha de la orden es obligatoria')
        .isISO8601().withMessage('La fecha debe tener un formato ISO válido'),
    
    body('teeth')
        .optional()
        .isArray().withMessage('Los dientes deben ser un arreglo'),
    
    body('teeth.*.tooth_id')
        .if(body('teeth').exists())
        .notEmpty().withMessage('El ID del diente es obligatorio')
        .isInt().withMessage('El ID del diente debe ser un número entero'),
    
    body('teeth.*.extraction')
        .if(body('teeth').exists())
        .isBoolean().withMessage('El campo extracción debe ser booleano'),

    body('teeth.*.areas')
        .if(body('teeth').exists())
        .optional()
        .isArray().withMessage('Las áreas deben ser un arreglo')
];

module.exports = {
    createExtractionOrderValidator
};
