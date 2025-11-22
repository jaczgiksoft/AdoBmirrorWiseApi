// src/modules/patient_type/patient_type.controller.js
const service = require('./patient_type.service');

module.exports = {
    list: async (req, res) => {
        try {
            const types = await service.list(req.user);
            res.json(types);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    get: async (req, res) => {
        try {
            const type = await service.get(req.params.id, req.user);
            res.json(type);
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const created = await service.create(req.body, req.user, req);
            res.status(201).json(created);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const updated = await service.update(req.params.id, req.body, req.user, req);
            res.json(updated);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await service.delete(req.params.id, req.user, req);
            res.json({ message: "Eliminado" });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
};
