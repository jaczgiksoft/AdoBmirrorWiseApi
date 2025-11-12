const patientNoteService = require('./patient_note.service');

// 🟢 Crear nueva nota
const create = async (req, res) => {
    try {
        const note = await patientNoteService.createPatientNote(req.body, req.user, req);
        res.status(201).json({ message: 'Nota creada exitosamente', note });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar nota existente
const update = async (req, res) => {
    try {
        const note = await patientNoteService.updatePatientNote(req.params.id, req.body, req.user, req);
        res.json({ message: 'Nota actualizada exitosamente', note });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar nota
const remove = async (req, res) => {
    try {
        await patientNoteService.deletePatientNote(req.params.id, req.user, req);
        res.json({ message: 'Nota eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener todas las notas de un paciente
const getByPatient = async (req, res) => {
    try {
        const notes = await patientNoteService.getNotesByPatientId(req.params.patient_id, req.user);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔍 Obtener una nota específica por ID
const getById = async (req, res) => {
    try {
        const note = await patientNoteService.getNoteById(req.params.id, req.user);
        if (!note) return res.status(404).json({ message: 'Nota no encontrada' });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getByPatient,
    getById,
};
