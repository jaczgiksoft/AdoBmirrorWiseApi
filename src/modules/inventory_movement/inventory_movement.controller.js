const movementService = require('./inventory_movement.service');

const getAll = async (req, res) => {
    try {
        const movements = await movementService.getAllMovements(req.user);
        res.json(movements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await movementService.registerMovement(req.body, req.user);
        res.status(201).json({ message: 'Movimiento registrado', ...result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getAll, create };
