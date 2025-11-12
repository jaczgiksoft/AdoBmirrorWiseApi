// src/modules/bracket_type/bracket_type.validator.js
const { body, param } = require('express-validator');

const createBracketTypeValidator = [
    // 🦷 Nombre
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del tipo de bracket es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no debe superar los 100 caracteres'),

    // 📝 Descripción
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no debe superar los 500 caracteres'),

    // ⚙️ Material
    body('material')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El material no debe superar los 50 caracteres'),

    // 🏭 Fabricante
    body('manufacturer')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre del fabricante no debe superar los 100 caracteres'),

    // 🎨 Color (hexadecimal)
    body('color')
        .optional()
        .matches(/^#([0-9A-F]{3}){1,2}$/i)
        .withMessage('El color debe tener formato hexadecimal válido (ej. #AABBCC)'),
];

const updateBracketTypeValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
    ...createBracketTypeValidator,
];

const getBracketTypeByIdValidator = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
];

module.exports = {
    createBracketTypeValidator,
    updateBracketTypeValidator,
    getBracketTypeByIdValidator,
};
