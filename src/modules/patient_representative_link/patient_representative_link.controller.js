const service = require('./patient_representative_link.service');

const list = async (req, res) => {
    try {
        const reps = await service.listForPatient(req.params.patient_id, req.user);
        res.json(reps);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const add = async (req, res) => {
    try {
        const link = await service.add(req.body, req.user, req);
        res.status(201).json({ message: 'Representante asignado', link });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await service.remove(req.params.id, req.user, req);
        res.json({ message: 'Representante removido' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const setPrimary = async (req, res) => {
    try {
        const link = await service.setPrimary(req.params.id, req.user, req);
        res.json({ message: 'Representante marcado como principal', link });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    list,
    add,
    remove,
    setPrimary
};
