// src/modules/notification/notification.controller.js
const notificationService = require('./notification.service');

// 🧩 Listar notificaciones del usuario
const getUserNotifications = async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const notifications = await notificationService.getUserNotifications(req.user, { skip, limit }, req);
        res.json(notifications);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📊 Contar no leídas
const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user);
        res.json({ unread: count });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟢 Marcar una como leída
const markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markNotificationAsRead(req.params.id, req.user);
        res.json({ message: 'Notificación marcada como leída', notification });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟢 Marcar todas como leídas
const markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user);
        res.json({ message: 'Todas las notificaciones fueron marcadas como leídas' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// =====================
// CREAR NOTIFICACIÓN GLOBAL (solo admin o roles con permiso write)
// =====================
const createSystemNotification = async (req, res) => {
    try {
        const { title, message, link } = req.body;
        if (!title || !message) {
            return res.status(400).json({ message: 'El título y mensaje son requeridos' });
        }

        const result = await notificationService.createSystemNotification({
            currentUser: req.user,
            title,
            message,
            link
        });

        res.json({ message: 'Notificación global enviada', result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createSystemNotification
};
