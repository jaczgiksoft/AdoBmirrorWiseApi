// src/modules/bracket_type/bracket_type.controller.js
const bracketTypeService = require('./bracket_type.service');

// 📋 Obtener todos los tipos de bracket del tenant
const getAll = async (req, res) => {
    try {
        const result = await bracketTypeService.getAll(req.user);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔍 Obtener un tipo de bracket por ID
const getOne = async (req, res) => {
    try {
        const result = await bracketTypeService.getById(req.params.id, req.user);
        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// 🟢 Crear un nuevo tipo de bracket
const create = async (req, res) => {
    try {
        const result = await bracketTypeService.create(req.body, req.user, req);
        res.status(201).json({ message: 'Tipo de bracket creado exitosamente', bracket_type: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar un tipo de bracket
const update = async (req, res) => {
    try {
        const result = await bracketTypeService.update(req.params.id, req.body, req.user, req);
        res.json({ message: 'Tipo de bracket actualizado exitosamente', bracket_type: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar un tipo de bracket (soft delete)
const softDelete = async (req, res) => {
    try {
        await bracketTypeService.delete(req.params.id, req.user, req);
        res.json({ message: 'Tipo de bracket eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📊 DataTable
const getDatatable = async (req, res) => {
    try {
        const result = await bracketTypeService.getDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    softDelete,
    getDatatable,
};
