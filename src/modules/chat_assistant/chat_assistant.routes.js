const express = require('express');
const router = express.Router();
const chatAssistantController = require('./chat_assistant.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

// Todas las rutas de Chat Assistant requieren autenticación
router.use(validateToken);

// POST /api/chat-assistant/ask
router.post('/ask', chatAssistantController.askChatAssistant);

module.exports = router;
