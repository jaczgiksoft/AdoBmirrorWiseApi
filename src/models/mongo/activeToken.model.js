const mongoose = require('mongoose');
const crypto = require('crypto');

const activeTokenSchema = new mongoose.Schema({
    user_id: { type: Number, required: true },
    token: { type: String, required: true }, // 🔐 se guardará hasheado
    jti: { type: String, required: false }, // 🆔 UUID del token (opcional por compatibilidad pero recomendado)
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true } // 👈 TTL
});

// ✅ índice compuesto: un usuario puede tener varios tokens
activeTokenSchema.index({ user_id: 1, token: 1 }, { unique: true });

// ✅ TTL index: Mongo borrará docs automáticamente cuando pase expires_at
activeTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Hashear token antes de guardar
activeTokenSchema.pre('save', function (next) {
    if (this.isModified('token')) {
        this.token = crypto.createHash('sha256').update(this.token).digest('hex');
    }
    next();
});

// Método para validar tokens
activeTokenSchema.methods.compareToken = function (token) {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    return this.token === hashed;
};

module.exports = mongoose.model('ActiveToken', activeTokenSchema);
