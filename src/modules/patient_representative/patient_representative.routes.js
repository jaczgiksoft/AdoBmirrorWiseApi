const express = require('express');
const router = express.Router();

const controller = require('./patient_representative.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createRepresentativeValidator,
    updateRepresentativeValidator,
    getRepresentativeByIdValidator
} = require('./patient_representative.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');

// 📋 Listar representantes
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_representatives'),
    controller.getAll
);

// 🔍 Obtener uno
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_representatives'),
    getRepresentativeByIdValidator,
    validateRequest,
    controller.getOne
);

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patient_representatives'),
    createRepresentativeValidator,
    validateRequest,
    controller.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patient_representatives'),
    updateRepresentativeValidator,
    validateRequest,
    controller.update
);

// 🔴 Eliminar (soft delete)
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patient_representatives'),
    getRepresentativeByIdValidator,
    validateRequest,
    controller.remove
);

module.exports = router;
