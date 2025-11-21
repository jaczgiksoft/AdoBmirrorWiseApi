const express = require('express');
const router = express.Router();

const referralController = require('./referral.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

const {
    createReferralValidator,
    updateReferralValidator,
    getReferralByIdValidator
} = require('./referral.validator');

// =========================
// RUTAS REFERIDOS
// =========================

// 📋 Listar todos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'referrals'),
    referralController.getAll
);

// 🔍 Obtener uno
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'referrals'),
    getReferralByIdValidator,
    validateRequest,
    referralController.getOne
);

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'referrals'),
    createReferralValidator,
    validateRequest,
    referralController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'referrals'),
    updateReferralValidator,
    validateRequest,
    referralController.update
);

// 🔴 Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'referrals'),
    getReferralByIdValidator,
    validateRequest,
    referralController.remove
);

module.exports = router;
