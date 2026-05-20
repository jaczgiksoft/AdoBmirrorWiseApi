const notificationTypeRepository = require('./notification_type.repository');
const sequelize = require('../../config/database');

class NotificationTypeService {
    async getAll(tenantId) {
        return notificationTypeRepository.findAllByTenant(tenantId);
    }

    async getById(id, tenantId) {
        const type = await notificationTypeRepository.findById(id, tenantId);
        if (!type) {
            throw new Error('Tipo de notificación no encontrado');
        }
        return type;
    }

    async create(data, tenantId) {
        const payload = {
            ...data,
            tenant_id: tenantId,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_system: false // Solo el sistema puede crear tipos is_system
        };

        const t = await sequelize.transaction();
        try {
            const result = await notificationTypeRepository.create(payload, t);
            await t.commit();
            return result;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async update(id, data, tenantId) {
        const type = await this.getById(id, tenantId);

        if (type.is_system) {
            throw new Error('No se pueden modificar los tipos de notificación del sistema');
        }

        const allowedFields = ['icon', 'color', 'default_title', 'default_message', 'is_active', 'metadata'];
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        const t = await sequelize.transaction();
        try {
            const result = await notificationTypeRepository.update(type, cleanData, t);
            await t.commit();
            return result;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async delete(id, tenantId) {
        const type = await this.getById(id, tenantId);

        if (type.is_system) {
            throw new Error('No se pueden eliminar los tipos de notificación del sistema');
        }

        const t = await sequelize.transaction();
        try {
            await notificationTypeRepository.delete(type, t);
            await t.commit();
            return { message: 'Tipo de notificación eliminado correctamente' };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

module.exports = new NotificationTypeService();
