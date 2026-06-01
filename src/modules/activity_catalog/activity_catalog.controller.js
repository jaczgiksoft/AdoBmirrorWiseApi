const activityCatalogService = require('./activity_catalog.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

const create = async (req, res) => {
    try {
        const activity = await activityCatalogService.create(req.body, req.user, req);
        res.status(201).json({ message: 'Actividad creada exitosamente', activity });
    } catch (err) {
        handleSequelizeError(res, err, {
            name: 'Ya existe una actividad con ese nombre.',
        });
    }
};

const update = async (req, res) => {
    try {
        const activity = await activityCatalogService.update(req.params.id, req.body, req.user, req);
        res.json({ message: 'Actividad actualizada exitosamente', activity });
    } catch (err) {
        handleSequelizeError(res, err, {
            name: 'Ya existe una actividad con ese nombre.',
        });
    }
};

const remove = async (req, res) => {
    try {
        await activityCatalogService.delete(req.params.id, req.user, req);
        res.json({ message: 'Actividad eliminada correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getAll = async (req, res) => {
    try {
        const activities = await activityCatalogService.getAll(req.user, req.query);
        res.json(activities);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getOne = async (req, res) => {
    try {
        const activity = await activityCatalogService.getById(req.params.id, req.user);
        res.json(activity);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne,
};
