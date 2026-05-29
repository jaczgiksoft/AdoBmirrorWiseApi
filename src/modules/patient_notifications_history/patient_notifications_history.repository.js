const PatientNotificationHistory = require('../../models/mysql/patient_notifications_history.model');
const Patient = require('../../models/mysql/patient.model');
const NotificationTemplate = require('../../models/mysql/notification_template.model');

class PatientNotificationsHistoryRepository {
    async findAllByPatient(patientId, tenantId) {
        return PatientNotificationHistory.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: NotificationTemplate, as: 'template', attributes: ['id', 'code', 'title_template'] }
            ],
            order: [['sent_at', 'DESC']]
        });
    }

    async findById(id, tenantId) {
        return PatientNotificationHistory.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: NotificationTemplate, as: 'template', attributes: ['id', 'code', 'title_template'] }
            ]
        });
    }

    async markAsRead(id, tenantId) {
        return PatientNotificationHistory.update(
            { is_read: true, read_at: new Date() },
            { where: { id, tenant_id: tenantId, is_read: false } }
        );
    }

    async markAllAsRead(patientId, tenantId) {
        return PatientNotificationHistory.update(
            { is_read: true, read_at: new Date() },
            { where: { patient_id: patientId, tenant_id: tenantId, is_read: false } }
        );
    }
}

module.exports = new PatientNotificationsHistoryRepository();
