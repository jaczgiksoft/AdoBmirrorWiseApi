const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true },
    ip: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    last_attempt: { type: Date, default: Date.now },
    blocked_until: { type: Date, default: null }
});

// Índice compuesto para detectar ataques distribuidos
loginAttemptSchema.index({ username: 1, ip: 1 }, { unique: true });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
