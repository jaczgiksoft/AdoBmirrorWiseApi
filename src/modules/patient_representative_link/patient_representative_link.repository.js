const PatientRepresentativeLink = require('../../models/mysql/patient_representative_link.model');
const PatientRepresentative = require('../../models/mysql/patient_representative.model');

class PatientRepresentativeLinkRepository {

    async findAllByPatient(patientId, tenantId) {
        return PatientRepresentativeLink.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                {
                    model: PatientRepresentative,
                    as: 'representative'
                }
            ],
            order: [['is_primary', 'DESC']]
        });
    }

    async findLink(patientId, representativeId, tenantId) {
        return PatientRepresentativeLink.findOne({
            where: { patient_id: patientId, representative_id: representativeId, tenant_id: tenantId }
        });
    }

    async findById(id, tenantId) {
        return PatientRepresentativeLink.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: PatientRepresentative, as: 'representative' }
            ]
        });
    }

    async createLink(data, transaction) {
        return PatientRepresentativeLink.create(data, { transaction });
    }

    async deleteLink(link, transaction) {
        return link.destroy({ transaction });
    }

    async unsetAllPrimary(patientId, tenantId, transaction) {
        return PatientRepresentativeLink.update(
            { is_primary: false },
            { where: { patient_id: patientId, tenant_id: tenantId }, transaction }
        );
    }
}

module.exports = new PatientRepresentativeLinkRepository();
