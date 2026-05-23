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
}

module.exports = new PatientNotificationsHistoryRepository();
