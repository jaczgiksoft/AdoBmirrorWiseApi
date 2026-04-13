const { body, param } = require('express-validator');

const createProviderValidator = [
    body('name').notEmpty().withMessage('El nombre es requerido').isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('contact_name').optional().isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('phone').optional().isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('email').optional().isEmail().withMessage('Email no válido').isLength({ max: 100 }),
    body('rfc').optional().isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('notes').optional()
];

const updateProviderValidator = [
    param('id').isInt().withMessage('ID inválido'),
    body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío').isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('contact_name').optional().isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    body('phone').optional().isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('email').optional().isEmail().withMessage('Email no válido').isLength({ max: 100 }),
    body('rfc').optional().isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('notes').optional()
];

const getProviderByIdValidator = [
    param('id').isInt().withMessage('ID inválido')
];

module.exports = {
    createProviderValidator,
    updateProviderValidator,
    getProviderByIdValidator
};
