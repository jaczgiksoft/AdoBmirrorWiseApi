const express = require('express');
const router = express.Router();
const aiAgentController = require('./ai_agent.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

// Todas las rutas de IA requieren autenticación
router.use(validateToken);

// POST /api/ai_agent/chat -> endpoint principal de interacción con el agente AI
router.post('/chat', aiAgentController.handleChat);

// GET /api/ai_agent/services-doctors -> provee servicios médicos (opcional, para test o si UI lo llama)
router.get('/services-doctors', aiAgentController.getAvailableServicesAndDoctors);

module.exports = router;
