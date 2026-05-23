const { body, param } = require('express-validator');

const createRuleValidator = [
    body('patient_id')
        .isInt().withMessage('El patient_id debe ser un número entero'),

    body('template_id')
        .optional({ nullable: true })
        .isInt().withMessage('El template_id debe ser un número entero'),

    body('custom_title')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 255 }).withMessage('El título personalizado no puede exceder 255 caracteres'),

    body('custom_message')
        .optional({ nullable: true })
        .trim(),

    body('start_time')
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('start_time debe tener un formato de hora válido HH:MM o HH:MM:SS'),

    body('end_time')
        .optional({ nullable: true })
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('end_time debe tener un formato de hora válido HH:MM o HH:MM:SS'),

    body('start_date')
        .optional({ nullable: true })
        .isISO8601().withMessage('start_date debe tener un formato de fecha válido (YYYY-MM-DD)'),

    body('end_date')
        .optional({ nullable: true })
        .isISO8601().withMessage('end_date debe tener un formato de fecha válido (YYYY-MM-DD)'),

    body('repeat_type')
        .isIn(['once', 'daily', 'weekly', 'monthly', 'custom'])
        .withMessage('repeat_type debe ser uno de: once, daily, weekly, monthly, custom'),

    body('repeat_days')
        .optional({ nullable: true })
        .isArray().withMessage('repeat_days debe ser un array'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('El campo is_active debe ser booleano'),

    body('context_data')
        .optional({ nullable: true })
        .isObject().withMessage('context_data debe ser un objeto JSON')
];

const updateRuleValidator = [
    param('id').isInt().withMessage('El ID de la regla debe ser un número entero'),
    
    body('patient_id')
        .optional()
        .isInt().withMessage('El patient_id debe ser un número entero'),

    body('template_id')
        .optional({ nullable: true })
        .isInt().withMessage('El template_id debe ser un número entero'),

    body('custom_title')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 255 }).withMessage('El título personalizado no puede exceder 255 caracteres'),

    body('custom_message')
        .optional({ nullable: true })
        .trim(),

    body('start_time')
        .optional()
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('start_time debe tener un formato de hora válido HH:MM o HH:MM:SS'),

    body('end_time')
        .optional({ nullable: true })
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('end_time debe tener un formato de hora válido HH:MM o HH:MM:SS'),

    body('start_date')
        .optional({ nullable: true })
        .isISO8601().withMessage('start_date debe tener un formato de fecha válido (YYYY-MM-DD)'),

    body('end_date')
        .optional({ nullable: true })
        .isISO8601().withMessage('end_date debe tener un formato de fecha válido (YYYY-MM-DD)'),

    body('repeat_type')
        .optional()
        .isIn(['once', 'daily', 'weekly', 'monthly', 'custom'])
        .withMessage('repeat_type debe ser uno de: once, daily, weekly, monthly, custom'),

    body('repeat_days')
        .optional({ nullable: true })
        .isArray().withMessage('repeat_days debe ser un array'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('El campo is_active debe ser booleano'),

    body('context_data')
        .optional({ nullable: true })
        .isObject().withMessage('context_data debe ser un objeto JSON')
];

module.exports = {
    createRuleValidator,
    updateRuleValidator
};
