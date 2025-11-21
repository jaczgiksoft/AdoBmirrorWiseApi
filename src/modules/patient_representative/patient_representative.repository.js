const PatientRepresentative = require('../../models/mysql/patient_representative.model');
const Tenant = require('../../models/mysql/tenant.model');

class PatientRepresentativeRepository {

    async findAllByTenant(tenantId) {
        return PatientRepresentative.findAll({
            where: { tenant_id: tenantId },
            order: [['full_name', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return PatientRepresentative.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] }
            ]
        });
    }

    async create(data, transaction) {
        return PatientRepresentative.create(data, { transaction });
    }

    async update(representative, data, transaction) {
        return representative.update(data, { transaction });
    }

    async softDelete(representative, transaction) {
        return representative.destroy({ transaction });
    }
}

module.exports = new PatientRepresentativeRepository();
