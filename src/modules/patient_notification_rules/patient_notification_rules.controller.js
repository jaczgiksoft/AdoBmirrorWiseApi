const patientNotificationRulesService = require('./patient_notification_rules.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

const getAll = async (req, res, next) => {
    try {
        const rules = await patientNotificationRulesService.getAll(req.user.tenant_id);
        res.status(200).json(rules);
    } catch (err) {
        logger.error(`Error al obtener reglas de notificación de pacientes: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const rule = await patientNotificationRulesService.getById(req.params.id, req.user.tenant_id);
        res.status(200).json(rule);
    } catch (err) {
        logger.error(`Error al obtener regla de notificación por ID: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getByPatient = async (req, res, next) => {
    try {
        const rules = await patientNotificationRulesService.getByPatient(req.params.patient_id, req.user.tenant_id);
        res.status(200).json(rules);
    } catch (err) {
        logger.error(`Error al obtener reglas por paciente: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const rule = await patientNotificationRulesService.create(req.body, req.user.tenant_id, req.user.id);
        res.status(201).json(rule);
    } catch (err) {
        logger.error(`Error al crear regla de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const rule = await patientNotificationRulesService.update(req.params.id, req.body, req.user.tenant_id);
        res.status(200).json(rule);
    } catch (err) {
        logger.error(`Error al actualizar regla de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await patientNotificationRulesService.delete(req.params.id, req.user.tenant_id);
        res.status(200).json(result);
    } catch (err) {
        logger.error(`Error al eliminar regla de notificación: ${err.message}`);
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
