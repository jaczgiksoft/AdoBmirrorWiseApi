const patientNotificationRepository = require('./patient_notification.repository');
const notificationTypeRepository = require('../notification_type/notification_type.repository');
const sequelize = require('../../config/database');

class PatientNotificationService {
    async getAll(tenantId) {
        return patientNotificationRepository.findAllByTenant(tenantId);
    }

    async getById(id, tenantId) {
        const notification = await patientNotificationRepository.findById(id, tenantId);
        if (!notification) {
            throw new Error('Notificación del paciente no encontrada');
        }
        return notification;
    }

    async getByPatient(patientId, tenantId) {
        return patientNotificationRepository.findAllByPatient(patientId, tenantId);
    }

    async create(data, tenantId, userId) {
        // Verificar que el tipo de notificación exista y sea accesible
        const notificationType = await notificationTypeRepository.findById(data.notification_type_id, tenantId);
        if (!notificationType) {
            throw new Error('Tipo de notificación no válido o no pertenece a su tenant');
        }

        const payload = {
            ...data,
            tenant_id: tenantId,
            created_by: userId,
            is_active: data.is_active !== undefined ? data.is_active : true
        };

        const t = await sequelize.transaction();
        try {
            const result = await patientNotificationRepository.create(payload, t);
            await t.commit();
            return result;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async update(id, data, tenantId) {
        const notification = await this.getById(id, tenantId);

        if (data.notification_type_id && data.notification_type_id !== notification.notification_type_id) {
            const notificationType = await notificationTypeRepository.findById(data.notification_type_id, tenantId);
            if (!notificationType) {
                throw new Error('Tipo de notificación no válido o no pertenece a su tenant');
            }
        }

        const allowedFields = [
            'notification_type_id',
            'title',
            'message',
            'start_time',
            'end_time',
            'start_date',
            'end_date',
            'repeat_type',
            'repeat_days',
            'is_active',
            'next_run_at',
            'metadata'
        ];

        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        const t = await sequelize.transaction();
        try {
            const result = await patientNotificationRepository.update(notification, cleanData, t);
            await t.commit();
            return result;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async delete(id, tenantId) {
        const notification = await this.getById(id, tenantId);

        const t = await sequelize.transaction();
        try {
            await patientNotificationRepository.delete(notification, t);
            await t.commit();
            return { message: 'Notificación de paciente eliminada correctamente' };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

module.exports = new PatientNotificationService();
