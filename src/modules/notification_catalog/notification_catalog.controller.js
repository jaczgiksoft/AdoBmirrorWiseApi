const notificationCatalogService = require('./notification_catalog.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

// Categories Controllers
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await notificationCatalogService.getAllCategories(req.user.tenant_id);
        res.status(200).json(categories);
    } catch (err) {
        logger.error(`Error al obtener categorías de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const category = await notificationCatalogService.getCategoryById(req.params.id, req.user.tenant_id);
        res.status(200).json(category);
    } catch (err) {
        logger.error(`Error al obtener categoría de notificación por ID: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await notificationCatalogService.createCategory(req.body, req.user.tenant_id);
        res.status(201).json(category);
    } catch (err) {
        logger.error(`Error al crear categoría de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const category = await notificationCatalogService.updateCategory(req.params.id, req.body, req.user.tenant_id);
        res.status(200).json(category);
    } catch (err) {
        logger.error(`Error al actualizar categoría de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const removeCategory = async (req, res, next) => {
    try {
        const result = await notificationCatalogService.deleteCategory(req.params.id, req.user.tenant_id);
        res.status(200).json(result);
    } catch (err) {
        logger.error(`Error al eliminar categoría de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

// Templates Controllers
const getAllTemplates = async (req, res, next) => {
    try {
        const templates = await notificationCatalogService.getAllTemplates(req.user.tenant_id);
        res.status(200).json(templates);
    } catch (err) {
        logger.error(`Error al obtener plantillas de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const getTemplateById = async (req, res, next) => {
    try {
        const template = await notificationCatalogService.getTemplateById(req.params.id, req.user.tenant_id);
        res.status(200).json(template);
    } catch (err) {
        logger.error(`Error al obtener plantilla de notificación por ID: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const createTemplate = async (req, res, next) => {
    try {
        const template = await notificationCatalogService.createTemplate(req.body, req.user.tenant_id);
        res.status(201).json(template);
    } catch (err) {
        logger.error(`Error al crear plantilla de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const updateTemplate = async (req, res, next) => {
    try {
        const template = await notificationCatalogService.updateTemplate(req.params.id, req.body, req.user.tenant_id);
        res.status(200).json(template);
    } catch (err) {
        logger.error(`Error al actualizar plantilla de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

const removeTemplate = async (req, res, next) => {
    try {
        const result = await notificationCatalogService.deleteTemplate(req.params.id, req.user.tenant_id);
        res.status(200).json(result);
    } catch (err) {
        logger.error(`Error al eliminar plantilla de notificación: ${err.message}`);
        await logApiError(req, err);
        next(err);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    removeCategory,
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    removeTemplate
};
