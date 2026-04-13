const PatientElastic = require('../../models/mysql/patient_elastic.model');

class PatientElasticRepository {
    async findByPatient(patientId, tenantId) {
        return PatientElastic.findAll({
            where: { 
                patient_id: patientId, 
                tenant_id: tenantId 
            },
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id, tenantId) {
        return PatientElastic.findOne({
            where: { id, tenant_id: tenantId }
        });
    }

    async create(data, transaction) {
        return PatientElastic.create(data, { transaction });
    }

    async update(id, data, tenantId, transaction) {
        return PatientElastic.update(data, {
            where: { id, tenant_id: tenantId },
            transaction
        });
    }

    async delete(id, tenantId, transaction) {
        return PatientElastic.destroy({
            where: { id, tenant_id: tenantId },
            transaction
        });
    }
}

module.exports = new PatientElasticRepository();
