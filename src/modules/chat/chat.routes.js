const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    sendMessageValidation,
    getHistoryValidation,
    markAsReadValidation
} = require('./chat.validator');

// Todas las rutas de chat requieren autenticación y carga de permisos
router.use(validateToken);
router.use(loadPermissions);

// 📋 Listar mis chats
router.get('/', chatController.getUserChats);

// 📜 Obtener historial de un chat
router.get(
    '/:id/history',
    getHistoryValidation,
    validateRequest,
    chatController.getHistory
);

// ✉️ Enviar un mensaje (Crea el chat si no existe)
router.post(
    '/send',
    sendMessageValidation,
    validateRequest,
    chatController.sendMessage
);

// 👁️ Marcar mensajes como leídos
router.put(
    '/:id/read',
    markAsReadValidation,
    validateRequest,
    chatController.markAsRead
);

module.exports = router;
