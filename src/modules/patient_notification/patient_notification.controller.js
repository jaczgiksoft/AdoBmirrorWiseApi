const patientNotificationService = require('./patient_notification.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

const getAll = async (req, res, next) => {
    try {
        const notifications = await patientNotificationService.getAll(req.user.tenant_id);
        res.status(200).json(notifications);
    } catch (err) {
        logger.error(`Error al obtener notificaciones de pacientes: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const notification = await patientNotificationService.getById(req.params.id, req.user.tenant_id);
        res.status(200).json(notification);
    } catch (err) {
        logger.error(`Error al obtener notificación de paciente por ID: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getByPatient = async (req, res, next) => {
    try {
        const notifications = await patientNotificationService.getByPatient(req.params.patient_id, req.user.tenant_id);
        res.status(200).json(notifications);
    } catch (err) {
        logger.error(`Error al obtener notificaciones por paciente: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const notification = await patientNotificationService.create(req.body, req.user.tenant_id, req.user.id);
        res.status(201).json(notification);
    } catch (err) {
        logger.error(`Error al crear notificación de paciente: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const notification = await patientNotificationService.update(req.params.id, req.body, req.user.tenant_id);
        res.status(200).json(notification);
    } catch (err) {
        logger.error(`Error al actualizar notificación de paciente: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await patientNotificationService.delete(req.params.id, req.user.tenant_id);
        res.status(200).json(result);
    } catch (err) {
        logger.error(`Error al eliminar notificación de paciente: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

module.exports = {
    getAll,
    getById,
    getByPatient,
    create,
    update,
    remove
};
