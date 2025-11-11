// src/modules/notification/notification.repository.js
const Notification = require('../../models/mongo/notification.model');

class NotificationRepository {
    async createNotification(data) {
        return Notification.create(data);
    }

    async bulkCreate(notifications) {
        if (!notifications?.length) return [];
        return Notification.insertMany(notifications, { ordered: false });
    }

    async findByUser(user, { skip = 0, limit = 20 } = {}) {
        return Notification.find({
            tenant_id: user.tenant_id,
            $or: [
                { user_id: user.id },
                {
                    type: 'system',
                    $or: [
                        { allowed_roles: user.role_id },
                        user.is_superadmin ? {} : null
                    ].filter(Boolean)
                }
            ]
        })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
    }

    async countUnread(user) {
        return Notification.countDocuments({
            tenant_id: user.tenant_id,
            $or: [
                { user_id: user.id, read: false },
                {
                    type: 'system',
                    allowed_roles: user.role_id,
                    read_by: { $ne: user.id }
                },
                user.is_superadmin
                    ? { type: 'system', read_by: { $ne: user.id } }
                    : null
            ].filter(Boolean)
        });
    }

    async markAsRead(notificationId, user) {
        const notif = await Notification.findById(notificationId);
        if (!notif) return null;

        if (notif.type === 'user') {
            notif.read = true;
        } else if (notif.type === 'system') {
            notif.read_by = notif.read_by || [];
            if (!notif.read_by.includes(user.id)) notif.read_by.push(user.id);
        }

        await notif.save();
        return notif;
    }

    async markAllAsRead(user) {
        await Notification.updateMany(
            { tenant_id: user.tenant_id, type: 'user', user_id: user.id, read: false },
            { $set: { read: true } }
        );

        await Notification.updateMany(
            { tenant_id: user.tenant_id, type: 'system', read_by: { $ne: user.id } },
            { $addToSet: { read_by: user.id } }
        );
    }
}

module.exports = new NotificationRepository();
