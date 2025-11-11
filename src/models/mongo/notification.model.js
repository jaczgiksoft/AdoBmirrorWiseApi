// src/models/mongo/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    tenant_id: { type: Number, required: true },
    user_id: { type: Number }, // opcional si es individual
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },

    type: {
        type: String,
        enum: ['user', 'system'], // user = individual | system = global
        default: 'user'
    },

    read: { type: Boolean, default: false },      // usado solo en tipo 'user'
    read_by: [{ type: Number }],                  // usado en tipo 'system'
    allowed_roles: [{ type: Number }],            // 👈 NUEVO campo: quién puede verla

    created_at: { type: Date, default: Date.now }
});

// Índices
notificationSchema.index({ user_id: 1, read: 1 });
notificationSchema.index({ tenant_id: 1, type: 1 });
notificationSchema.index({ allowed_roles: 1 });
notificationSchema.index({ tenant_id: 1, allowed_roles: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
