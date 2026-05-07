const { body, param } = require('express-validator');

// ✉️ Validación para enviar mensaje
const sendMessageValidation = [
    body('receiver_id')
        .notEmpty().withMessage('El ID del receptor es obligatorio')
        .isInt().withMessage('El ID del receptor debe ser un número entero'),
    
    body('message')
        .trim()
        .notEmpty().withMessage('El mensaje no puede estar vacío')
        .isLength({ max: 2000 }).withMessage('El mensaje es demasiado largo')
];

// 📜 Validación para historial
const getHistoryValidation = [
    param('id')
        .isInt().withMessage('El ID del chat debe ser un número entero')
];

// 👁️ Validación para marcar como leído
const markAsReadValidation = [
    param('id')
        .isInt().withMessage('El ID del chat debe ser un número entero')
];

module.exports = {
    sendMessageValidation,
    getHistoryValidation,
    markAsReadValidation
};
