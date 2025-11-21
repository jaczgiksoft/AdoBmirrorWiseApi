const referralService = require('./referral.service');

// 📋 Listar
const getAll = async (req, res) => {
    try {
        const referrals = await referralService.getAll(req.user);
        res.json(referrals);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

// 🔍 Obtener uno
const getOne = async (req, res) => {
    try {
        const referral = await referralService.getOne(req.params.id, req.user);
        res.json(referral);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// 🟢 Crear
const create = async (req, res) => {
    try {
        const newReferral = await referralService.createReferral(req.body, req.user, req);
        res.status(201).json({ message: 'Referidor creado exitosamente', referral: newReferral });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar
const update = async (req, res) => {
    try {
        const referral = await referralService.updateReferral(req.params.id, req.body, req.user, req);
        res.json({ message: 'Referidor actualizado exitosamente', referral });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar
const remove = async (req, res) => {
    try {
        await referralService.deleteReferral(req.params.id, req.user, req);
        res.json({ message: 'Referidor eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };
