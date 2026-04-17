const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
    token_hash: { type: String, required: true }, // 🔐 token hasheado (Argaman2)
    user_id: { type: Number, required: true },
    user_type: { type: String, enum: ['employee', 'patient'], default: 'employee' },
    tenant_id: { type: Number, required: true }, // Asegurar aislamiento
    family_id: { type: String, required: true }, // 👨‍👩‍👧‍👦 Para rotación y revocación en familia
    is_revoked: { type: Boolean, default: false },
    device_info: {
        ip: String,
        user_agent: String
    },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true } // 👈 TTL
});

// ✅ Índices
refreshTokenSchema.index({ token_hash: 1 }); // Búsqueda rápida
refreshTokenSchema.index({ family_id: 1 }); // Revocación en bloque
refreshTokenSchema.index({ user_id: 1 }); // Búsqueda por usuario
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // Auto-limpieza

// Método estático para hashear tokens
refreshTokenSchema.statics.hashToken = function (token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
