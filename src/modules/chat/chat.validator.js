const { body, param } = require('express-validator');

// ✉️ Validación para enviar mensaje (privado o grupo)
const sendMessageValidation = [
    body().custom((value, { req }) => {
        if (!req.body.receiver_id && !req.body.chat_id) {
            throw new Error('Debe proporcionar receiver_id o chat_id');
        }
        return true;
    }),
    
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

// 👥 Validación para crear grupo
const createGroupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del grupo es obligatorio')
        .isLength({ max: 255 }).withMessage('El nombre del grupo es demasiado largo'),

    body('participant_ids')
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un participante')
        .custom((ids) => ids.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Todos los IDs de participantes deben ser enteros positivos')
];

// ➕ Validación para agregar participante
const addParticipantValidation = [
    param('id')
        .isInt().withMessage('El ID del chat debe ser un número entero'),

    body('user_id')
        .notEmpty().withMessage('El ID del usuario es obligatorio')
        .isInt().withMessage('El ID del usuario debe ser un número entero')
];

// ➖ Validación para eliminar participante
const removeParticipantValidation = [
    param('id')
        .isInt().withMessage('El ID del chat debe ser un número entero'),

    param('userId')
        .isInt().withMessage('El ID del usuario debe ser un número entero')
];

module.exports = {
    sendMessageValidation,
    getHistoryValidation,
    markAsReadValidation,
    createGroupValidation,
    addParticipantValidation,
    removeParticipantValidation
};
