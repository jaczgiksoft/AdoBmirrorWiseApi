const { body, param } = require('express-validator');

// 🟢 Creación de Área Clínica
const createClinicAreaValidator = [
    // 📢 Detalles del área clínica
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del área clínica es obligatorio')
        .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),

    body('status')
        .optional()
        .isIn(['active', 'maintenance', 'inactive']).withMessage('El estado debe ser active, maintenance o inactive'),
];

// 🟡 Actualización de Área Clínica
const updateClinicAreaValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
    ...createClinicAreaValidator.map(v => {
        // convierte todos los campos en opcionales en actualización
        if (v.builder?.fields) v.builder.optional = true;
        return v;
    }),
];

// 🔍 Obtener Área Clínica por ID
const getClinicAreaByIdValidator = [
    param('id')
        .isInt().withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createClinicAreaValidator,
    updateClinicAreaValidator,
    getClinicAreaByIdValidator,
};
