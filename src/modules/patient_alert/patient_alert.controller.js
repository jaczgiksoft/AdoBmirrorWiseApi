const patientAlertService = require('./patient_alert.service');

// 🟢 Crear nueva alerta para un paciente
const create = async (req, res) => {
    try {
        const alert = await patientAlertService.createPatientAlert(req.body, req.user, req);
        res.status(201).json({ message: 'Alerta creada exitosamente', alert });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar una alerta existente
const update = async (req, res) => {
    try {
        const alert = await patientAlertService.updatePatientAlert(req.params.id, req.body, req.user, req);
        res.json({ message: 'Alerta actualizada exitosamente', alert });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar alerta (borrado físico con log)
const remove = async (req, res) => {
    try {
        await patientAlertService.deletePatientAlert(req.params.id, req.user, req);
        res.json({ message: 'Alerta eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener todas las alertas de un paciente (Uso administrativo)
const getByPatient = async (req, res) => {
    try {
        const alerts = await patientAlertService.getAlertsByPatientId(req.params.patient_id, req.user);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📋 Obtener todas las alertas del paciente autenticado (Portal Paciente)
const getMyAlerts = async (req, res) => {
    try {
        // En el login de paciente (auth.service.js), el req.user.id es el patient.id
        const alerts = await patientAlertService.getAlertsByPatientId(req.user.id, req.user);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getByPatient,
    getMyAlerts,
};
