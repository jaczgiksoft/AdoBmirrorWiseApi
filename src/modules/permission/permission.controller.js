// src/modules/permission/permission.controller.js
const permissionService = require('./permission.service');

const getByRole = async (req, res) => {
    try {
        const result = await permissionService.getByRole(req.params.role_id, req.user, req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateByRole = async (req, res) => {
    try {
        const result = await permissionService.updateByRole(req.params.role_id, req.body, req.user, req);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAllModules = async (req, res) => {
    try {
        const result = await permissionService.getAllModules(req.user, req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getByRole, updateByRole, getAllModules };
