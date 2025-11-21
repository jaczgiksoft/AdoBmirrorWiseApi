const service = require('./patient_representative.service');

const getAll = async (req, res) => {
    try {
        const reps = await service.getAll(req.user);
        res.json(reps);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const rep = await service.getOne(req.params.id, req.user);
        res.json(rep);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const rep = await service.create(req.body, req.user, req);
        res.status(201).json({ message: 'Representante creado', rep });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const rep = await service.update(req.params.id, req.body, req.user, req);
        res.json({ message: 'Representante actualizado', rep });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await service.delete(req.params.id, req.user, req);
        res.json({ message: 'Representante eliminado' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    remove
};
