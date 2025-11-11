// src/modules/cashSession/cashSession.routes.js
const express = require('express');
const router = express.Router();

const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

const cashSessionController = require('./cashSession.controller');
const { openSessionValidator, closeSessionValidator } = require('./cashSession.validator');
const checkCashSession = require('../../middlewares/checkCashSession.middleware'); // 🔹 nuevo

// =====================
// CASH SESSIONS ROUTES
// =====================

// DataTable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'cashSessions'),
    cashSessionController.getDatatable
);

// Abrir sesión
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'cashSessions'),
    checkCashSession,
    openSessionValidator,
    validateRequest,
    cashSessionController.openSession
);

// Cerrar sesión
router.put(
    '/:id/close',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'cashSessions'),
    closeSessionValidator,
    validateRequest,
    cashSessionController.closeSession
);

module.exports = router;
