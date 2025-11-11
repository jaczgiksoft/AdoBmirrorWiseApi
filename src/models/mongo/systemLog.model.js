const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    user_id: { type: Number, required: true },
    user_name: { type: String },
    action: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String, required: true, maxlength: 2000 }, // límite
    ip: { type: String },
    user_agent: { type: String },
    created_at: { type: Date, default: Date.now }
});

// Índice para consultas por usuario y fecha
systemLogSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
