// src/modules/category/category.controller.js
const categoryService = require('./category.service');

const getAll = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json(category);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body, req.user, req);
        res.status(201).json({ message: 'Categoría creada', category });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body, req.user, req);
        res.json({ message: 'Categoría actualizada', category });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id, req.user, req);
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await categoryService.getCategoriesDatatable(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete, getDatatable };
