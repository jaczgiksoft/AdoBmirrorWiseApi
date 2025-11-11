// src/modules/cashSession/cashSession.controller.js
const cashSessionService = require('./cashSession.service');

const openSession = async (req, res) => {
    try {
        const session = await cashSessionService.openSession(req.body, req.user, req);
        res.status(201).json({ message: 'Sesión abierta', session });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const closeSession = async (req, res) => {
    try {
        const session = await cashSessionService.closeSession(req.params.id, req.body, req.user, req);
        res.json({ message: 'Sesión cerrada', session });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await cashSessionService.getDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { openSession, closeSession, getDatatable };
