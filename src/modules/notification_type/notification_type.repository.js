const NotificationType = require('../../models/mysql/notification_type.model');
const { Op } = require('sequelize');

class NotificationTypeRepository {
    async findAllByTenant(tenantId) {
        return NotificationType.findAll({
            where: {
                [Op.or]: [
                    { tenant_id: tenantId },
                    { tenant_id: null } // System-wide notification types
                ]
            },
            order: [['default_title', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return NotificationType.findOne({
            where: {
                id,
                [Op.or]: [
                    { tenant_id: tenantId },
                    { tenant_id: null }
                ]
            }
        });
    }

    async create(data, transaction) {
        return NotificationType.create(data, { transaction });
    }

    async update(notificationType, data, transaction) {
        return notificationType.update(data, { transaction });
    }

    async delete(notificationType, transaction) {
        return notificationType.destroy({ transaction });
    }
}

module.exports = new NotificationTypeRepository();
