// src/modules/brand/brand.controller.js
const brandService = require('./brand.service');

const getAll = async (req, res) => {
    try {
        const brands = await brandService.getAllBrands(req.user);
        res.json(brands);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const brand = await brandService.getBrandById(req.params.id, req.user);
        res.json(brand);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const brand = await brandService.createBrand(req.body, req.user, req);
        res.status(201).json({ message: 'Marca creada', brand });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const brand = await brandService.updateBrand(req.params.id, req.body, req.user, req);
        res.json({ message: 'Marca actualizada', brand });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await brandService.deleteBrand(req.params.id, req.user, req);
        res.json({ message: 'Marca eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await brandService.getBrandsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete, getDatatable };
