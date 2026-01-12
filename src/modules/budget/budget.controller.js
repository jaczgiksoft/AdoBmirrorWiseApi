const budgetService = require('./budget.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 🟢 Crear presupuesto
const create = async (req, res) => {
    try {
        const budget = await budgetService.createBudget(req.body, req.user, req);
        res.status(201).json({ message: 'Presupuesto creado exitosamente', budget });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🟡 Actualizar presupuesto
const update = async (req, res) => {
    try {
        const budget = await budgetService.updateBudget(req.params.id, req.body, req.user, req);
        res.json({ message: 'Presupuesto actualizado exitosamente', budget });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔴 Eliminar presupuesto
const remove = async (req, res) => {
    try {
        await budgetService.deleteBudget(req.params.id, req.user, req);
        res.json({ message: 'Presupuesto eliminado correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📋 Listar por paciente
const getByPatient = async (req, res) => {
    try {
        const budgets = await budgetService.getBudgetsByPatient(req.params.patientId, req.user);
        res.json(budgets);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    create,
    update,
    remove,
    getByPatient
};
