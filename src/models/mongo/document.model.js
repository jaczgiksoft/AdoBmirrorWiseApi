const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    tenant_id: { type: Number, required: true },   // multi-tenant
    entity: { type: String, required: true },      // módulo: 'employee', 'procedure', 'user', etc.
    entity_id: { type: Number, required: true },   // ID en MySQL del recurso
    original_filename: { type: String, required: true }, // nombre original
    stored_filename: { type: String, required: true },   // nombre en disco
    type: { type: String, default: 'otro' },       // tipo de documento (contrato, perfil, procedimiento, etc.)
    uploaded_at: { type: Date, default: Date.now }
});

// Index para búsquedas rápidas
documentSchema.index({ tenant_id: 1, entity: 1, entity_id: 1 });

module.exports = mongoose.model('Document', documentSchema);
