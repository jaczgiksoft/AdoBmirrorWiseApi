const { body, param } = require('express-validator');

const createElasticTypeValidator = [
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim(),
    body('color')
        .optional()
        .isHexColor().withMessage('El color debe ser un valor hexadecimal válido'),
    body('type')
        .optional()
        .isString().withMessage('El tipo debe ser una cadena de texto'),
    body('size')
        .notEmpty().withMessage('El tamaño es obligatorio')
        .isString().withMessage('El tamaño debe ser una cadena de texto'),
    body('oz')
        .notEmpty().withMessage('La fuerza (oz) es obligatoria')
        .isString().withMessage('La fuerza debe ser una cadena de texto'),
];

const updateElasticTypeValidator = [
    param('id').isInt().withMessage('ID inválido'),
    body('name')
        .optional()
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim(),
    body('color')
        .optional()
        .isHexColor().withMessage('El color debe ser un valor hexadecimal válido'),
    body('type')
        .optional()
        .isString().withMessage('El tipo debe ser una cadena de texto'),
    body('size')
        .optional()
        .notEmpty().withMessage('El tamaño no puede estar vacío')
        .isString().withMessage('El tamaño debe ser una cadena de texto'),
    body('oz')
        .optional()
        .notEmpty().withMessage('La fuerza no puede estar vacía')
        .isString().withMessage('La fuerza debe ser una cadena de texto'),
];

const getElasticTypeByIdValidator = [
    param('id').isInt().withMessage('ID inválido'),
];

module.exports = {
    createElasticTypeValidator,
    updateElasticTypeValidator,
    getElasticTypeByIdValidator,
};
