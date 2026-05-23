const { body, param } = require('express-validator');

const createCategoryValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre de la categoría es obligatorio')
        .isLength({ max: 255 }).withMessage('El nombre no puede exceder 255 caracteres'),
    body('icon')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El icono no puede exceder 100 caracteres'),
    body('color')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 50 }).withMessage('El color no puede exceder 50 caracteres'),
    body('is_active')
        .optional()
        .isBoolean().withMessage('El campo is_active debe ser booleano')
];

const updateCategoryValidator = [
    param('id').isInt().withMessage('El ID de la categoría debe ser un número entero'),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .isLength({ max: 255 }).withMessage('El nombre no puede exceder 255 caracteres'),
    body('icon')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El icono no puede exceder 100 caracteres'),
    body('color')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 50 }).withMessage('El color no puede exceder 50 caracteres'),
    body('is_active')
        .optional()
        .isBoolean().withMessage('El campo is_active debe ser booleano')
];

const createTemplateValidator = [
    body('category_id')
        .isInt().withMessage('El category_id debe ser un número entero'),
    body('code')
        .trim()
        .notEmpty().withMessage('El código de la plantilla es obligatorio')
        .isLength({ max: 100 }).withMessage('El código no puede exceder 100 caracteres'),
    body('title_template')
        .trim()
        .notEmpty().withMessage('El título de la plantilla es obligatorio')
        .isLength({ max: 255 }).withMessage('El título no puede exceder 255 caracteres'),
    body('message_template')
        .trim()
        .notEmpty().withMessage('El mensaje de la plantilla es obligatorio'),
    body('language')
        .optional()
        .trim()
        .isLength({ max: 10 }).withMessage('El idioma no puede exceder 10 caracteres'),
    body('allowed_placeholders')
        .optional({ nullable: true })
        .isArray().withMessage('allowed_placeholders debe ser un array')
];

const updateTemplateValidator = [
    param('id').isInt().withMessage('El ID de la plantilla debe ser un número entero'),
    body('category_id')
        .optional()
        .isInt().withMessage('El category_id debe ser un número entero'),
    body('code')
        .optional()
        .trim()
        .notEmpty().withMessage('El código no puede estar vacío')
        .isLength({ max: 100 }).withMessage('El código no puede exceder 100 caracteres'),
    body('title_template')
        .optional()
        .trim()
        .notEmpty().withMessage('El título no puede estar vacío')
        .isLength({ max: 255 }).withMessage('El título no puede exceder 255 caracteres'),
    body('message_template')
        .optional()
        .trim()
        .notEmpty().withMessage('El mensaje no puede estar vacío'),
    body('language')
        .optional()
        .trim()
        .isLength({ max: 10 }).withMessage('El idioma no puede exceder 10 caracteres'),
    body('allowed_placeholders')
        .optional({ nullable: true })
        .isArray().withMessage('allowed_placeholders debe ser un array')
];

module.exports = {
    createCategoryValidator,
    updateCategoryValidator,
    createTemplateValidator,
    updateTemplateValidator
};
