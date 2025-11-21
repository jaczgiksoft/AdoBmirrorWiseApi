const PatientBillingData = require('../../models/mysql/patient_billing_data.model');
const BillingData = require('../../models/mysql/billing_data.model');
const Patient = require('../../models/mysql/patient.model');

class PatientBillingRepository {

    async findAllByPatient(patientId, tenantId) {
        return PatientBillingData.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: BillingData, as: 'billing_data' }
            ],
            order: [['is_primary', 'DESC']]
        });
    }

    async findLink(patientId, billingDataId, tenantId) {
        return PatientBillingData.findOne({
            where: { patient_id: patientId, billing_data_id: billingDataId, tenant_id: tenantId }
        });
    }

    async createLink(data, transaction) {
        return PatientBillingData.create(data, { transaction });
    }

    async deleteLink(link, transaction) {
        return link.destroy({ transaction });
    }

    async setPrimaryForPatient(patientId, tenantId, transaction) {
        return PatientBillingData.update(
            { is_primary: false },
            { where: { patient_id: patientId, tenant_id: tenantId }, transaction }
        );
    }

    async findById(id, tenantId) {
        return PatientBillingData.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: BillingData, as: 'billing_data' },
                { model: Patient, as: 'patient' }
            ]
        });
    }
}

module.exports = new PatientBillingRepository();
