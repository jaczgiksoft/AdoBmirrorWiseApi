const stepService = require('./step.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

const create = async (req, res) => {
    try {
        const step = await stepService.createStep(req.body, req.user, req);
        res.status(201).json({ message: 'Paso creado exitosamente', step });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const update = async (req, res) => {
    try {
        const step = await stepService.updateStep(req.params.id, req.body, req.user, req);
        res.json({ message: 'Paso actualizado exitosamente', step });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const remove = async (req, res) => {
    try {
        await stepService.deleteStep(req.params.id, req.user, req);
        res.json({ message: 'Paso eliminado correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getAll = async (req, res) => {
    try {
        const steps = await stepService.getAllSteps(req.user);
        res.json(steps);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await stepService.getStepsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getOne = async (req, res) => {
    try {
        const step = await stepService.getStepById(req.params.id, req.user);
        res.json(step);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    create,
    update,
    remove,
    getAll,
    getDatatable,
    getOne,
};
