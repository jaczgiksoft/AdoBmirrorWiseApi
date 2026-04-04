const express = require('express');
const router = express.Router();

const controller = require('./patient_billing_data.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    addValidator,
    linkOrCreateValidator,
    updateLinkOrCreateValidator,
    idValidator,
    patientIdValidator
} = require('./patient_billing_data.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');

// 📋 Listar BillingData asignados a un paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'billing_data'),
    patientIdValidator,
    validateRequest,
    controller.list
);

// 🟢 Asignar BillingData a un paciente
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'billing_data'),
    addValidator,
    validateRequest,
    controller.add
);

// ⭐ Find or Create Unified 
router.post(
    '/link-or-create',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'billing_data'),
    linkOrCreateValidator,
    validateRequest,
    controller.linkOrCreate
);

// 🟠 Update Unified 
router.put(
    '/link-or-create/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'billing_data'),
    updateLinkOrCreateValidator,
    validateRequest,
    controller.updateLinkOrCreate
);

// 🔴 Eliminar relación
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'billing_data'),
    idValidator,
    validateRequest,
    controller.remove
);

// ⭐ Marcar como principal
router.put(
    '/set-primary/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'billing_data'),
    idValidator,
    validateRequest,
    controller.setPrimary
);

module.exports = router;
