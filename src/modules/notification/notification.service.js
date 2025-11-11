// src/modules/notification/notification.service.js
const notificationRepository = require('./notification.repository');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { emitNotification } = require('../../bootstrap');

class NotificationService {
    async getUserNotifications(currentUser, { skip = 0, limit = 20 }, req) {
        try {
            const notifications = await notificationRepository.findByUser(currentUser, { skip, limit });
            return notifications.map(n => ({
                id: n._id,
                title: n.title,
                message: n.message,
                link: n.link,
                read: n.type === 'user'
                    ? n.read
                    : n.read_by?.includes(currentUser.id),
                type: n.type,
                created_at: n.created_at
            }));
        } catch (err) {
            logger.error(`Error al obtener notificaciones: ${err.message}`);
            await logApiError(req, err);
            throw new Error('Error al obtener notificaciones');
        }
    }

    async getUnreadCount(currentUser) {
        return notificationRepository.countUnread(currentUser);
    }

    async markNotificationAsRead(notificationId, currentUser) {
        const notif = await notificationRepository.markAsRead(notificationId, currentUser);
        if (!notif) throw new Error('Notificación no encontrada');
        return notif;
    }

    async markAllAsRead(currentUser) {
        await notificationRepository.markAllAsRead(currentUser);
        return true;
    }

    async sendNotification(data) {
        return notificationRepository.createNotification(data);
    }

}

module.exports = new NotificationService();
