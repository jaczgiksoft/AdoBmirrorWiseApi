// src/modules/unit/unit.controller.js
const unitService = require('./unit.service');

const getAll = async (req, res) => {
    try {
        const units = await unitService.getAllUnits();
        res.json(units);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const unit = await unitService.getUnitById(req.params.id);
        res.json(unit);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const unit = await unitService.createUnit(req.body, req.user, req);
        res.status(201).json({ message: 'Unidad creada', unit });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const unit = await unitService.updateUnit(req.params.id, req.body, req.user, req);
        res.json({ message: 'Unidad actualizada', unit });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await unitService.deleteUnit(req.params.id, req.user, req);
        res.json({ message: 'Unidad eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await unitService.getUnitsDatatable(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete, getDatatable };
