// src/modules/log/log.controller.js
const logService = require('./log.service');

const getLogs = async (req, res) => {
    try {
        const result = await logService.getLogs(req.query, req.user, req);
        res.json(result);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getRecentLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await logService.getRecentLogs(limit, req.user, req);
        res.json(result);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await logService.getLogsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

module.exports = {
    getLogs,
    getRecentLogs,
    getDatatable
};
