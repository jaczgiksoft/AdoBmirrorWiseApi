const occupationService = require('./occupation.service');

// 📋 Listar
const getAll = async (req, res) => {
    try {
        const occupations = await occupationService.getAll(req.user);
        res.json(occupations);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

// 🔍 Obtener uno
const getOne = async (req, res) => {
    try {
        const occupation = await occupationService.getOne(req.params.id, req.user);
        res.json(occupation);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// 🟢 Crear
const create = async (req, res) => {
    try {
        const newOccupation = await occupationService.createOccupation(req.body, req.user, req);
        res.status(201).json({ message: 'Ocupación creada exitosamente', occupation: newOccupation });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar
const update = async (req, res) => {
    try {
        const occupation = await occupationService.updateOccupation(req.params.id, req.body, req.user, req);
        res.json({ message: 'Ocupación actualizada exitosamente', occupation });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar
const remove = async (req, res) => {
    try {
        await occupationService.deleteOccupation(req.params.id, req.user, req);
        res.json({ message: 'Ocupación eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };
