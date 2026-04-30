const elasticTypeService = require('./elastic_type.service');

const getAll = async (req, res) => {
    try {
        const result = await elasticTypeService.getAll(req.user);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const result = await elasticTypeService.getById(req.params.id, req.user);
        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await elasticTypeService.create(req.body, req.user, req);
        res.status(201).json({ message: 'Tipo de elástico creado exitosamente', elastic_type: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const result = await elasticTypeService.update(req.params.id, req.body, req.user, req);
        res.json({ message: 'Tipo de elástico actualizado exitosamente', elastic_type: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await elasticTypeService.delete(req.params.id, req.user, req);
        res.json({ message: 'Tipo de elástico eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await elasticTypeService.getDatatable(req.body, req.user);
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
