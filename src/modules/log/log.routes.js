const express = require('express');
const router = express.Router();

const logController = require('./log.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { getLogsValidator, getRecentLogsValidator } = require('./log.validator');

// =====================
// RUTAS DE LOGS
// =====================

// 🔹 DataTable (server-side) → siempre ANTES de otras rutas POST
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'logs'),
    logController.getDatatable
);

// 🔹 Listado con filtros y paginación
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'logs'),
    getLogsValidator,
    validateRequest,
    logController.getLogs
);

// 🔹 Últimos logs recientes
router.get(
    '/recent',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'logs'),
    getRecentLogsValidator,
    validateRequest,
    logController.getRecentLogs
);

module.exports = router;
