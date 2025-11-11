const mongoose = require('mongoose');

const apiErrorSchema = new mongoose.Schema({
    user_id: { type: Number, default: null },
    route: { type: String, required: true },
    method: { type: String },
    status_code: { type: Number },
    message: { type: String },
    stack: { type: String, maxlength: 2000 }, // 🔐 limitamos tamaño
    ip: { type: String },
    user_agent: { type: String },
    created_at: { type: Date, default: Date.now }
});

// Índice para buscar errores recientes rápido
apiErrorSchema.index({ created_at: -1 });

module.exports = mongoose.model('ApiError', apiErrorSchema);
