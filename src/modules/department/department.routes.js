const express = require('express');
const router = express.Router();

const departmentController = require('./department.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createDepartmentValidator,
    updateDepartmentValidator,
    getDepartmentByIdValidator,
} = require('./department.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// ===============================
// 📋 Departamentos (CRUD completo)
// ===============================

// 🔹 Obtener todos los departamentos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'departments'),
    departmentController.getAll
);

// 🔹 Obtener un departamento por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'departments'),
    getDepartmentByIdValidator,
    validateRequest,
    departmentController.getOne
);

// 🔹 DataTable (paginado + búsqueda)
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'departments'),
    departmentController.getDatatable
);

// 🔹 Crear nuevo departamento
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'departments'),
    createDepartmentValidator,
    validateRequest,
    departmentController.create
);

// 🔹 Actualizar departamento existente
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'departments'),
    updateDepartmentValidator,
    validateRequest,
    departmentController.update
);

// 🔹 Eliminación lógica (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'departments'),
    getDepartmentByIdValidator,
    validateRequest,
    departmentController.softDelete
);

module.exports = router;
