const processService = require('./process.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

const create = async (req, res) => {
    try {
        const process = await processService.createProcess(req.body, req.user, req);
        res.status(201).json({ message: 'Proceso creado exitosamente', process });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const update = async (req, res) => {
    try {
        const process = await processService.updateProcess(req.params.id, req.body, req.user, req);
        res.json({ message: 'Proceso actualizado exitosamente', process });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const remove = async (req, res) => {
    try {
        await processService.deleteProcess(req.params.id, req.user, req);
        res.json({ message: 'Proceso eliminado correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getAll = async (req, res) => {
    try {
        const processes = await processService.getAllProcesses(req.user);
        res.json(processes);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await processService.getProcessesDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

const getOne = async (req, res) => {
    try {
        const process = await processService.getProcessById(req.params.id, req.user);
        res.json(process);
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
