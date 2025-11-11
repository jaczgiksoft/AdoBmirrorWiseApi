// src/modules/cashRegister/cashRegister.controller.js
const cashRegisterService = require('./cashRegister.service');

const getAll = async (req, res) => {
    try {
        const result = await cashRegisterService.getAll(req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const result = await cashRegisterService.getById(req.params.id, req.user);
        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const getByCode = async (req, res) => {
    try {
        const result = await cashRegisterService.getByCode(req.params.code, req.user);
        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await cashRegisterService.create(req.body, req.user, req);
        res.status(201).json({ message: 'Caja creada', cashRegister: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const result = await cashRegisterService.update(req.params.id, req.body, req.user, req);
        res.json({ message: 'Caja actualizada', cashRegister: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await cashRegisterService.delete(req.params.id, req.user, req);
        res.json({ message: 'Caja eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await cashRegisterService.getDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getById, getByCode, create, update, remove, getDatatable };
