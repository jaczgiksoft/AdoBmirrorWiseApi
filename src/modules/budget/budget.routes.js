const express = require('express');
const router = express.Router();

const budgetController = require('./budget.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

const {
    createBudgetValidator,
    updateBudgetValidator,
    getByPatientValidator
} = require('./budget.validator');

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'budgets'), // Asumiendo permiso 'budgets', si no existe usar 'patients' o similar
    createBudgetValidator,
    validateRequest,
    budgetController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'budgets'),
    updateBudgetValidator,
    validateRequest,
    budgetController.update
);

// 🔴 Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'budgets'),
    budgetController.remove
);

// 📋 Listar por Paciente
router.get(
    '/patient/:patientId',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'budgets'),
    getByPatientValidator,
    validateRequest,
    budgetController.getByPatient
);

module.exports = router;
