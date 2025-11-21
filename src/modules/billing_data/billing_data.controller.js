const billingService = require('./billing_data.service');

const getAll = async (req, res) => {
    try {
        const list = await billingService.getAllBilling(req.user);
        res.json(list);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const data = await billingService.getBillingById(req.params.id, req.user);
        res.json(data);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const data = await billingService.createBilling(req.body, req.user, req);
        res.status(201).json({ message: 'Dato fiscal creado', data });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const data = await billingService.updateBilling(req.params.id, req.body, req.user, req);
        res.json({ message: 'Dato fiscal actualizado', data });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await billingService.deleteBilling(req.params.id, req.user, req);
        res.json({ message: 'Dato fiscal eliminado' });
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
