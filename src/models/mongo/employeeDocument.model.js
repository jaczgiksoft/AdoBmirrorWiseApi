const mongoose = require('mongoose');

const employeeDocumentSchema = new mongoose.Schema({
    employee_id: { type: Number, required: true }, // ID de MySQL
    original_filename: { type: String, required: true },
    stored_filename: { type: String, required: true },
    type: { type: String, default: 'otro' },
    uploaded_at: { type: Date, default: Date.now }
});

// ❌ ya no guardamos path absoluto aquí
// el backend construye la ruta en base al stored_filename y reglas internas

module.exports = mongoose.model('EmployeeDocument', employeeDocumentSchema);
