// src/modules/patient_gallery/patient_gallery.validator.js
const { body } = require('express-validator');

/**
 * Validaciones para la creación de una carpeta de galería
 */
const createGalleryValidator = [
    body('patient_id')
        .notEmpty().withMessage('El ID del paciente es obligatorio')
        .isInt().withMessage('El ID del paciente debe ser un número entero'),
    
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre de la colección es obligatorio')
        .isString().withMessage('El nombre debe ser una cadena de texto'),
    
    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto')
];

module.exports = {
    createGalleryValidator
};
