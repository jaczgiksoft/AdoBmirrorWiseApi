// src/modules/tenantFeature/tenantFeature.controller.js
const tenantFeatureService = require('./tenantFeature.service');

const getAll = async (req, res) => {
    try {
        const features = await tenantFeatureService.getAllFeatures(req.user.tenant_id);
        res.json(features);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const feature = await tenantFeatureService.getFeatureById(req.params.id, req.user.tenant_id);
        res.json(feature);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const feature = await tenantFeatureService.createFeature(req.body, req.user, req);
        res.status(201).json({ message: 'Feature creada correctamente', feature });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const feature = await tenantFeatureService.updateFeature(req.params.id, req.body, req.user, req);
        res.json({ message: 'Feature actualizada correctamente', feature });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await tenantFeatureService.deleteFeature(req.params.id, req.user, req);
        res.json({ message: 'Feature eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await tenantFeatureService.getFeaturesDatatable(req.body, req.user.tenant_id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getDatatable
};
