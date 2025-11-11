// src/modules/role/role.controller.js
const roleService = require('./role.service');

const getAll = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles(req.user);
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const role = await roleService.getRoleById(req.params.id, req.user);
        res.json(role);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const role = await roleService.createRole(req.body, req.user, req);
        res.status(201).json({ message: 'Rol creado', role });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const role = await roleService.updateRole(req.params.id, req.body, req.user, req);
        res.json({ message: 'Rol actualizado', role });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await roleService.deleteRole(req.params.id, req.user, req);
        res.json({ message: 'Rol eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await roleService.getRolesDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete, getDatatable };
