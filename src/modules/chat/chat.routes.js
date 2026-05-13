const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    sendMessageValidation,
    getHistoryValidation,
    markAsReadValidation,
    createGroupValidation,
    addParticipantValidation,
    removeParticipantValidation
} = require('./chat.validator');

// Todas las rutas de chat requieren autenticación y carga de permisos
router.use(validateToken);
router.use(loadPermissions);

// ─────────────────────────────────────────────────────────────
// CHATS GENERALES
// ─────────────────────────────────────────────────────────────

// 📋 Listar mis chats (privados y grupales)
router.get('/', chatController.getUserChats);

// 📜 Obtener historial de un chat (con reads por mensaje)
router.get(
    '/:id/history',
    getHistoryValidation,
    validateRequest,
    chatController.getHistory
);

// ✉️ Enviar un mensaje privado (crea el chat si no existe)
router.post(
    '/send',
    sendMessageValidation,
    validateRequest,
    chatController.sendMessage
);

// 👁️ Marcar mensajes como leídos (emite messages_seen por WebSocket)
router.put(
    '/:id/read',
    markAsReadValidation,
    validateRequest,
    chatController.markAsRead
);

// ─────────────────────────────────────────────────────────────
// GRUPOS
// ─────────────────────────────────────────────────────────────

// 👥 Crear un grupo
router.post(
    '/group',
    createGroupValidation,
    validateRequest,
    chatController.createGroup
);

// ➕ Agregar participante a un grupo (solo admin del grupo)
router.post(
    '/:id/participants',
    addParticipantValidation,
    validateRequest,
    chatController.addParticipant
);

// ➖ Eliminar/salir de un grupo
router.delete(
    '/:id/participants/:userId',
    removeParticipantValidation,
    validateRequest,
    chatController.removeParticipant
);

module.exports = router;
