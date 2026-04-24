const PatientRepresentative = require('../../models/mysql/patient_representative.model');
const Tenant = require('../../models/mysql/tenant.model');
const Patient = require('../../models/mysql/patient.model');

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

    async findByUsernameWithPatients(username) {
        return PatientRepresentative.findOne({
            where: { username },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name', 'code'] },
                {
                    model: Patient,
                    as: 'patients',
                    attributes: ['id', 'first_name', 'last_name', 'photo_url', 'tenant_id'],
                    through: { attributes: [] }
                }
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
