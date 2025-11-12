const patientConversationService = require('./patient_conversation.service');

// 🟢 Crear nueva conversación
const create = async (req, res) => {
    try {
        const conversation = await patientConversationService.createPatientConversation(req.body, req.user, req);
        res.status(201).json({ message: 'Conversación creada exitosamente', conversation });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar conversación existente
const update = async (req, res) => {
    try {
        const conversation = await patientConversationService.updatePatientConversation(req.params.id, req.body, req.user, req);
        res.json({ message: 'Conversación actualizada exitosamente', conversation });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar conversación
const remove = async (req, res) => {
    try {
        await patientConversationService.deletePatientConversation(req.params.id, req.user, req);
        res.json({ message: 'Conversación eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener todas las conversaciones de un paciente
const getByPatient = async (req, res) => {
    try {
        const conversations = await patientConversationService.getConversationsByPatientId(req.params.patient_id, req.user);
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔍 Obtener una conversación específica por ID
const getById = async (req, res) => {
    try {
        const conversation = await patientConversationService.getConversationById(req.params.id, req.user);
        if (!conversation) return res.status(404).json({ message: 'Conversación no encontrada' });
        res.json(conversation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getByPatient,
    getById,
};
