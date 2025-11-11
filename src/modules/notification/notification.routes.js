// src/modules/notification/notification.routes.js
const express = require('express');
const router = express.Router();

const notificationController = require('./notification.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

// =====================
// RUTAS DE NOTIFICACIONES
// =====================

// 🔹 Listar notificaciones del usuario actual
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'notifications'),
    notificationController.getUserNotifications
);

// 🔹 Contar notificaciones no leídas
router.get(
    '/unread-count',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'notifications'),
    notificationController.getUnreadCount
);

// 🔹 Marcar una notificación como leída
router.put(
    '/:id/read',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'notifications'),
    notificationController.markAsRead
);

// 🔹 Marcar todas como leídas
router.put(
    '/read-all',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'notifications'),
    notificationController.markAllAsRead
);

// 🔹 Crear una notificación global (solo roles con permiso write)
router.post(
    '/system',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'notifications'),
    notificationController.createSystemNotification
);

module.exports = router;
