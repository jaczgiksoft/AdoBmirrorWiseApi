// src/modules/periodontogram/periodontogram.repository.js
const Periodontogram = require('../../models/mysql/periodontogram.model');

class PeriodontogramRepository {
    async findLatestByPatient(patientId, tenantId) {
        return Periodontogram.findOne({
            where: { patient_id: patientId, tenant_id: tenantId },
            order: [['exam_date', 'DESC']]
        });
    }

    async findAllByPatient(patientId, tenantId) {
        return Periodontogram.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            order: [['exam_date', 'DESC']]
        });
    }

    async findById(id, tenantId) {
        return Periodontogram.findOne({
            where: { id, tenant_id: tenantId }
        });
    }

    async create(data, transaction) {
        return Periodontogram.create(data, { transaction });
    }

    async update(record, data, transaction) {
        return record.update(data, { transaction });
    }

    async delete(id, tenantId, transaction) {
        return Periodontogram.destroy({
            where: { id, tenant_id: tenantId },
            transaction
        });
    }
}

module.exports = new PeriodontogramRepository();
