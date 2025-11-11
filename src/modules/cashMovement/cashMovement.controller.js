const cashMovementService = require('./cashMovement.service');

// =====================
// CREAR MOVIMIENTO
// =====================
const create = async (req, res) => {
    try {
        const movement = await cashMovementService.createMovement(req.body, req.user, req);
        res.status(201).json({ message: 'Movimiento registrado', movement });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// =====================
// DETALLE MOVIMIENTO
// =====================
const getById = async (req, res) => {
    try {
        const movement = await cashMovementService.getMovementById(req.params.id, req.user);
        res.json(movement);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// =====================
// DATATABLE
// =====================
const getDatatable = async (req, res) => {
    try {
        const result = await cashMovementService.getMovementsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    getById,
    getDatatable
};
