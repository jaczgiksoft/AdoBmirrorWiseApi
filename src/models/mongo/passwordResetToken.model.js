const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
    user_id: { type: Number, required: true },
    token: { type: String, required: true, unique: true }, // 🔐 se guardará hasheado
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true }
});

// TTL para auto-borrado
passwordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Hashear token antes de guardar
passwordResetTokenSchema.pre('save', function (next) {
    if (this.isModified('token')) {
        this.token = crypto.createHash('sha256').update(this.token).digest('hex');
    }
    next();
});

passwordResetTokenSchema.methods.compareToken = function (token) {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    return this.token === hashed;
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
