const patientPrescriptionService = require('./patient_prescription.service');

// 🟢 Crear nueva prescripción para un paciente
const create = async (req, res) => {
    try {
        const prescription = await patientPrescriptionService.createPatientPrescription(req.body, req.user, req);
        res.status(201).json({ message: 'Prescripción creada exitosamente', prescription });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar una prescripción existente
const update = async (req, res) => {
    try {
        const prescription = await patientPrescriptionService.updatePatientPrescription(req.params.id, req.body, req.user, req);
        res.json({ message: 'Prescripción actualizada exitosamente', prescription });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar prescripción (borrado físico con log)
const remove = async (req, res) => {
    try {
        await patientPrescriptionService.deletePatientPrescription(req.params.id, req.user, req);
        res.json({ message: 'Prescripción eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener todas las prescripciones de un paciente
const getByPatient = async (req, res) => {
    try {
        const prescriptions = await patientPrescriptionService.getByPatientId(req.params.patient_id, req.user);
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getByPatient,
};
