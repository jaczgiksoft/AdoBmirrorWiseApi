// src/modules/tax/tax.controller.js
const taxService = require('./tax.service');

const getAll = async (req, res) => {
    try {
        const taxes = await taxService.getAllTaxes();
        res.json(taxes);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const tax = await taxService.getTaxById(req.params.id);
        res.json(tax);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const tax = await taxService.createTax(req.body, req.user, req);
        res.status(201).json({ message: 'Impuesto creado', tax });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const tax = await taxService.updateTax(req.params.id, req.body, req.user, req);
        res.json({ message: 'Impuesto actualizado', tax });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await taxService.deleteTax(req.params.id, req.user, req);
        res.json({ message: 'Impuesto eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await taxService.getTaxesDatatable(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete, getDatatable };
