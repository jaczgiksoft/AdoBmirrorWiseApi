const patientNotificationsHistoryService = require('./patient_notifications_history.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

const getByPatient = async (req, res, next) => {
    try {
        const history = await patientNotificationsHistoryService.getByPatient(req.params.patient_id, req.user.tenant_id);
        res.status(200).json(history);
    } catch (err) {
        logger.error(`Error al obtener historial de notificaciones por paciente: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const record = await patientNotificationsHistoryService.getById(req.params.id, req.user.tenant_id);
        res.status(200).json(record);
    } catch (err) {
        logger.error(`Error al obtener registro de historial por ID: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const record = await patientNotificationsHistoryService.markAsRead(req.params.id, req.user.tenant_id);
        res.status(200).json(record);
    } catch (err) {
        logger.error(`Error al marcar notificación como leída: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const result = await patientNotificationsHistoryService.markAllAsRead(req.params.patient_id, req.user.tenant_id);
        res.status(200).json(result);
    } catch (err) {
        logger.error(`Error al marcar todas como leídas: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

module.exports = {
    getByPatient,
    getById,
    markAsRead,
    markAllAsRead
};
