const express = require('express');
const router = express.Router();

const controller = require('./patient_representative_link.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    addValidator,
    idValidator,
    patientIdValidator
} = require('./patient_representative_link.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');

// 📋 Listar representantes de un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'patient_representatives'),
    patientIdValidator,
    validateRequest,
    controller.list
);

// 🟢 Asignar representante a paciente
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'patient_representatives'),
    addValidator,
    validateRequest,
    controller.add
);

// 🔴 Eliminar relación
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'patient_representatives'),
    idValidator,
    validateRequest,
    controller.remove
);

// ⭐ Marcar como representante principal
router.put(
    '/set-primary/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'patient_representatives'),
    idValidator,
    validateRequest,
    controller.setPrimary
);

module.exports = router;
