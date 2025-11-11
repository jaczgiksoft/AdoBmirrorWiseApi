// src/modules/user/user.controller.js
const userService = require('./user.service');

const getAll = async (req, res) => {
    try {
        const users = await userService.getAllUsers(req.user);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id, req.user);
        res.json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const user = await userService.createUser(req.body, req.user, req);
        res.status(201).json({ message: 'Usuario registrado', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body, req.user, req);
        res.json({ message: 'Usuario actualizado correctamente', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id, req.user, req);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await userService.getUsersDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getById, create, update, softDelete, getDatatable };
