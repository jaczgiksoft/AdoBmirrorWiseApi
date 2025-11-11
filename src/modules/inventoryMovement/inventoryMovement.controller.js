// src/modules/inventoryMovement/inventoryMovement.controller.js
const inventoryMovementService = require('./inventoryMovement.service');

const create = async (req, res) => {
    try {
        const movement = await inventoryMovementService.createMovement(req.body, req.user, req);
        res.status(201).json({ message: 'Movimiento registrado', movement });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const movement = await inventoryMovementService.getMovementById(req.params.id, req.user);
        res.json(movement);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await inventoryMovementService.getMovementsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { create, getOne, getDatatable };
