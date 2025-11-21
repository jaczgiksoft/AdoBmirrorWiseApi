const patientService = require('./patient.service');

// 📋 Obtener todos los pacientes (por tenant)
const getAll = async (req, res) => {
    try {
        const patients = await patientService.getAllPatients(req.user);
        res.json(patients);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

// 🔍 Obtener un paciente por ID
const getOne = async (req, res) => {
    try {
        const patient = await patientService.getPatientById(req.params.id, req.user);
        if (!patient) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.json(patient);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// 🟢 Crear nuevo paciente
const create = async (req, res) => {
    try {
        // 🧩 Si el frontend envía patient_type_ids como string JSON, parsearlo
        if (typeof req.body.patient_type_ids === 'string') {
            try {
                req.body.patient_type_ids = JSON.parse(req.body.patient_type_ids);
            } catch {
                req.body.patient_type_ids = [];
            }
        }

        const patient = await patientService.createPatient(req.body, req.user, req);
        res.status(201).json({ message: 'Paciente creado exitosamente', patient });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar paciente
const update = async (req, res) => {
    try {
        // 🧩 Asegurar que patient_type_ids llegue como array
        if (typeof req.body.patient_type_ids === 'string') {
            try {
                req.body.patient_type_ids = JSON.parse(req.body.patient_type_ids);
            } catch {
                req.body.patient_type_ids = [];
            }
        }

        const patient = await patientService.updatePatient(req.params.id, req.body, req.user, req);
        res.json({ message: 'Paciente actualizado exitosamente', patient });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar (soft delete)
const softDelete = async (req, res) => {
    try {
        await patientService.deletePatient(req.params.id, req.user, req);
        res.json({ message: 'Paciente eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📊 DataTable (listado con filtros)
const getDatatable = async (req, res) => {
    try {
        const result = await patientService.getPatientsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ⚙️ Obtener perfil completo del paciente (expediente clínico)
const getProfile = async (req, res) => {
    try {
        const profile = await patientService.getPatientProfile(req.params.id, req.user);
        if (!profile) {
            return res.status(404).json({ message: 'Perfil del paciente no encontrado' });
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🆕 Generar siguiente número de expediente
const getNextMedicalRecord = async (req, res) => {
    try {
        const next = await patientService.getNextMedicalRecord(req.user);
        res.json({ next });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    softDelete,
    getDatatable,
    getProfile,
    getNextMedicalRecord
};
