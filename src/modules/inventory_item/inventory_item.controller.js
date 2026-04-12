const itemService = require('./inventory_item.service');

const getAll = async (req, res) => {
    try {
        const items = await itemService.getAllItems(req.user);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const item = await itemService.getItemById(req.params.id, req.user);
        res.json(item);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const item = await itemService.createItem(req.body, req.user);
        res.status(201).json({ message: 'Artículo creado', item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const item = await itemService.updateItem(req.params.id, req.body, req.user);
        res.json({ message: 'Artículo actualizado', item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await itemService.deleteItem(req.params.id, req.user);
        res.json({ message: 'Artículo eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete };
