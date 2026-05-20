const PatientNotification = require('../../models/mysql/patient_notification.model');
const Patient = require('../../models/mysql/patient.model');
const NotificationType = require('../../models/mysql/notification_type.model');

class PatientNotificationRepository {
    async findAllByTenant(tenantId) {
        return PatientNotification.findAll({
            where: { tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: NotificationType, as: 'notification_type', attributes: ['id', 'default_title'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id, tenantId) {
        return PatientNotification.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: NotificationType, as: 'notification_type', attributes: ['id', 'default_title'] }
            ]
        });
    }

    async findAllByPatient(patientId, tenantId) {
        return PatientNotification.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: NotificationType, as: 'notification_type', attributes: ['id', 'default_title'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async create(data, transaction) {
        return PatientNotification.create(data, { transaction });
    }

    async update(patientNotification, data, transaction) {
        return patientNotification.update(data, { transaction });
    }

    async delete(patientNotification, transaction) {
        return patientNotification.destroy({ transaction });
    }
}

module.exports = new PatientNotificationRepository();
