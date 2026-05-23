const PatientNotificationRule = require('../../models/mysql/patient_notification_rule.model');
const Patient = require('../../models/mysql/patient.model');
const NotificationTemplate = require('../../models/mysql/notification_template.model');
const NotificationCategory = require('../../models/mysql/notification_category.model');
const User = require('../../models/mysql/user.model');

class PatientNotificationRulesRepository {
    async findAllByTenant(tenantId) {
        return PatientNotificationRule.findAll({
            where: { tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'email'] },
                {
                    model: NotificationTemplate,
                    as: 'template',
                    attributes: ['id', 'code', 'title_template', 'message_template'],
                    include: [
                        { model: NotificationCategory, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }
                    ]
                },
                { model: User, as: 'creator', attributes: ['id', 'username'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id, tenantId) {
        return PatientNotificationRule.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'email'] },
                {
                    model: NotificationTemplate,
                    as: 'template',
                    attributes: ['id', 'code', 'title_template', 'message_template'],
                    include: [
                        { model: NotificationCategory, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }
                    ]
                },
                { model: User, as: 'creator', attributes: ['id', 'username'] }
            ]
        });
    }

    async findAllByPatient(patientId, tenantId) {
        return PatientNotificationRule.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                {
                    model: NotificationTemplate,
                    as: 'template',
                    attributes: ['id', 'code', 'title_template', 'message_template'],
                    include: [
                        { model: NotificationCategory, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }
                    ]
                },
                { model: User, as: 'creator', attributes: ['id', 'username'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async create(data, transaction) {
        return PatientNotificationRule.create(data, { transaction });
    }

    async update(patientNotificationRule, data, transaction) {
        return patientNotificationRule.update(data, { transaction });
    }

    async delete(patientNotificationRule, transaction) {
        return patientNotificationRule.destroy({ transaction });
    }
}

module.exports = new PatientNotificationRulesRepository();
