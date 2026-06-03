const { body, param } = require('express-validator');

// 🟢 Creación de Cita
const createAppointmentValidator = [
    // Campos obligatorios
    body('patient_id')
        .isInt({ gt: 0 }).withMessage('El paciente es obligatorio'),

    body('employee_id')
        .isInt({ gt: 0 }).withMessage('El doctor es obligatorio'),

    body('clinic_area_id')
        .isInt({ gt: 0 }).withMessage('El área clínica (sillón) es obligatoria'),

    body('date')
        .isISO8601().withMessage('La fecha debe ser válida (YYYY-MM-DD)'),

    body('start_time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('La hora de inicio debe ser válida (HH:mm)'),

    body('end_time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('La hora de fin debe ser válida (HH:mm)'),

    body('unit_value')
        .isInt({ gt: 0 }).withMessage('El valor unitario (minutos por unidad) es requerido'),

    body('units')
        .isInt({ gt: 0 }).withMessage('La cantidad de unidades es requerida'),

    body('total_amount')
        .isDecimal().withMessage('El monto total debe ser un número decimal válido'),

    // Campos opcionales pero validados si existen
    body('services')
        .optional()
        .isArray().withMessage('Los servicios deben ser un arreglo'),

    body('services.*.service_id')
        .if(body('services').exists())
        .isInt().withMessage('El ID del servicio es requerido'),

    body('services.*.price')
        .if(body('services').exists())
        .isDecimal().withMessage('El precio del servicio debe ser válido'),
];

// 🟡 Actualización de Cita
const updateAppointmentValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),

    // Al actualizar, se permite parcialidad en algunos diseños, pero mantendremos validaciones fuertes si se envían los campos
    body('patient_id').optional().isInt({ gt: 0 }),
    body('employee_id').optional().isInt({ gt: 0 }),
    body('clinic_area_id').optional().isInt({ gt: 0 }),
    body('date').optional().isISO8601(),
    body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('unit_value').optional().isInt({ gt: 0 }),
    body('units').optional().isInt({ gt: 0 }),
    body('total_amount').optional().isDecimal(),
];

// 🔍 Obtener Cita por ID
const getAppointmentByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

// 🔍 Obtener Citas por Paciente
const getAppointmentsByPatientValidator = [
    param('patient_id')
        .isInt().withMessage('El ID del paciente debe ser un número entero'),
];

// 🔍 Obtener evaluación de cita
const getAppointmentEvaluationValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

// 🟡 Crear/Actualizar evaluación de cita
const upsertAppointmentEvaluationValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),

    body('oralHygiene')
        .optional()
        .isInt({ min: 0, max: 3 }).withMessage('oralHygiene debe ser un entero entre 0 y 3'),

    body('applianceCare')
        .optional()
        .isInt({ min: 0, max: 3 }).withMessage('applianceCare debe ser un entero entre 0 y 3'),

    body('elasticUsage')
        .optional()
        .isInt({ min: 0, max: 3 }).withMessage('elasticUsage debe ser un entero entre 0 y 3'),

    body('treatmentProgress')
        .optional()
        .isInt({ min: 0, max: 3 }).withMessage('treatmentProgress debe ser un entero entre 0 y 3'),

    body('comments')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('comments no puede exceder 5000 caracteres'),

    body()
        .custom(body => {
            const allowedKeys = ['oralHygiene', 'applianceCare', 'elasticUsage', 'treatmentProgress', 'comments'];
            const hasAny = allowedKeys.some(key => body[key] !== undefined);
            if (!hasAny) {
                throw new Error('Debe proporcionar al menos un campo de evaluación');
            }
            return true;
        }),
];

module.exports = {
    createAppointmentValidator,
    updateAppointmentValidator,
    getAppointmentByIdValidator,
    getAppointmentsByPatientValidator,
    getAppointmentEvaluationValidator,
    upsertAppointmentEvaluationValidator,
};
