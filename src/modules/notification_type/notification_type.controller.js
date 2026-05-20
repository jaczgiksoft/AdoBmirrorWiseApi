const notificationTypeService = require('./notification_type.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

const getAll = async (req, res, next) => {
    try {
        const types = await notificationTypeService.getAll(req.user.tenant_id);
        res.status(200).json(types);
    } catch (err) {
        logger.error(`Error al obtener tipos de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const type = await notificationTypeService.getById(req.params.id, req.user.tenant_id);
        res.status(200).json(type);
    } catch (err) {
        logger.error(`Error al obtener tipo de notificación por ID: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const type = await notificationTypeService.create(req.body, req.user.tenant_id);
        res.status(201).json(type);
    } catch (err) {
        logger.error(`Error al crear tipo de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const type = await notificationTypeService.update(req.params.id, req.body, req.user.tenant_id);
        res.status(200).json(type);
    } catch (err) {
        logger.error(`Error al actualizar tipo de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await notificationTypeService.delete(req.params.id, req.user.tenant_id);
        res.status(200).json(result);
    } catch (err) {
        logger.error(`Error al eliminar tipo de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
