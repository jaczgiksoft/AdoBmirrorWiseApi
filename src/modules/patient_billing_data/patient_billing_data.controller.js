const service = require('./patient_billing_data.service');

const list = async (req, res) => {
    try {
        const result = await service.getBillingForPatient(req.params.patient_id, req.user);
        res.json(result);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const add = async (req, res) => {
    try {
        const result = await service.addBillingToPatient(req.body, req.user, req);
        res.status(201).json({ message: 'Relacion creada', result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const linkOrCreate = async (req, res) => {
    try {
        const result = await service.linkOrCreate(req.body, req.user, req);
        res.status(201).json({ message: 'Dato fiscal procesado exitosamente', result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateLinkOrCreate = async (req, res) => {
    try {
        const result = await service.updateLinkOrCreate(req.params.id, req.body, req.user, req);
        res.json({ message: 'Dato fiscal actualizado exitosamente', result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await service.removeBillingFromPatient(req.params.id, req.user, req);
        res.json({ message: 'Relacion eliminada' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const setPrimary = async (req, res) => {
    try {
        const result = await service.setPrimary(req.params.id, req.user, req);
        res.json({ message: 'Dato fiscal marcado como principal', result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    list,
    add,
    linkOrCreate,
    updateLinkOrCreate,
    remove,
    setPrimary
};
