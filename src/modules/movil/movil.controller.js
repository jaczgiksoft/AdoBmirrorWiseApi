const appointmentService = require('../appointment/appointment.service');
const activityCatalogService = require('../activity_catalog/activity_catalog.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 🔍 Historial clínico de paciente (Mobile)
const getPatientClinicalHistory = async (req, res) => {
    try {
        // En la app móvil, el paciente es el usuario autenticado (req.user)
        const patientId = req.user.id;
        
        // Se reutiliza el servicio de appointment existente
        const result = await appointmentService.getPatientClinicalHistory(patientId, req.query, req.user, req);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔍 Obtener evaluación de una cita (Mobile)
const getAppointmentEvaluation = async (req, res) => {
    try {
        const evaluation = await appointmentService.getAppointmentEvaluation(req.params.id, req.user);
        res.json(evaluation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener catálogo de actividades (Mobile)
const getActivityCatalog = async (req, res) => {
    try {
        const activities = await activityCatalogService.getAll(req.user, req.query);
        res.json(activities);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    getPatientClinicalHistory,
    getAppointmentEvaluation,
    getActivityCatalog
};
