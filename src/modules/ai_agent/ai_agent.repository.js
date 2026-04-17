const ChatHistory = require('../../models/mongo/chatHistory.model');

class AiAgentRepository {
    /**
     * Guarda un mensaje en el historial.
     */
    async saveMessage(patient_id, tenant_id, role, message, tool_calls = null, tool_call_id = null, name = null) {
        const payload = {
            patient_id,
            tenant_id,
            role,
            message
        };

        if (tool_calls) payload.tool_calls = tool_calls;
        if (tool_call_id) payload.tool_call_id = tool_call_id;
        if (name) payload.name = name;

        const chatBlock = new ChatHistory(payload);
        return await chatBlock.save();
    }

    /**
     * Recupera los últimos N mensajes del paciente para inyectarlo como contexto en OpenAI
     */
    async getRecentMessages(patient_id, tenant_id, limit = 10) {
        // Ordenamos por created_at de forma descendente para obtener los más recientes
        // y luego los invertimos (ascendentes) para pasarlos en el orden normal de un chat a OpenAI
        const messages = await ChatHistory.find({ patient_id, tenant_id })
            .sort({ created_at: -1 })
            .limit(limit)
            .lean();
        
        return messages.reverse();
    }
}

module.exports = new AiAgentRepository();
