const { body, param } = require('express-validator');

/**
 * Validaciones comunes para crear o actualizar departamentos.
 */
const baseDepartmentValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del departamento es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no debe superar los 100 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('La descripción no debe superar los 255 caracteres'),

    body('profit_margin')
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El margen de ganancia debe ser un número decimal con hasta 2 decimales')
        .custom((value) => {
            if (value < 0 || value > 100) {
                throw new Error('El margen de ganancia debe estar entre 0 y 100');
            }
            return true;
        }),

    body('use_parent_profit_margin')
        .optional()
        .isBoolean()
        .withMessage('El campo use_parent_profit_margin debe ser verdadero o falso'),

    body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('El estado debe ser "active" o "inactive"'),
];

/**
 * Validadores individuales
 */
const createDepartmentValidator = [
    ...baseDepartmentValidation,
];

const updateDepartmentValidator = [
    param('id')
        .isInt()
        .withMessage('El ID del departamento debe ser un número entero'),
    ...baseDepartmentValidation,
];

const getDepartmentByIdValidator = [
    param('id')
        .isInt()
        .withMessage('El ID del departamento debe ser un número entero'),
];

module.exports = {
    createDepartmentValidator,
    updateDepartmentValidator,
    getDepartmentByIdValidator,
};
