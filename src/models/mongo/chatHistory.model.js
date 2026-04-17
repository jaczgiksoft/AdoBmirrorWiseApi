const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    patient_id: { type: Number, required: true },
    tenant_id: { type: Number, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
    message: { type: String }, // Puede ser opcional si es una llamada a función (tool call)
    tool_calls: { type: mongoose.Schema.Types.Mixed }, // Para guardar el historial de las funciones
    tool_call_id: { type: String }, // ID de la llamada si el rol es 'tool'
    name: { type: String }, // Nombre de la función si el rol es 'tool'
    created_at: { type: Date, default: Date.now }
});

// Índice para consultas por paciente y orden cronológico
chatHistorySchema.index({ tenant_id: 1, patient_id: 1, created_at: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
