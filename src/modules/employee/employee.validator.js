const { body, param } = require('express-validator');

// 🧩 Creación/Edición
const employeeValidationRules = [
    body('first_name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('last_name')
        .trim()
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),

    body('second_last_name').optional().trim(),

    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage('El email no es válido'),

    body('phone').optional().trim(),
    
    body('role_id')
        .notEmpty().withMessage('El rol es obligatorio')
        .isInt().withMessage('El rol debe ser un ID válido'),

    body('positionIds')
        .isArray({ min: 1 }).withMessage('Debe seleccionar al menos un puesto'),

    body('positionIds.*')
        .isInt().withMessage('Los puestos deben ser IDs válidos'),

    body('is_appointment_eligible')
        .optional()
        .isBoolean().withMessage('is_appointment_eligible debe ser booleano'),

    body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Estado inválido')
];

// 🆔 ID param
const employeeIdValidator = [
    param('id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    employeeValidationRules,
    employeeIdValidator
};
