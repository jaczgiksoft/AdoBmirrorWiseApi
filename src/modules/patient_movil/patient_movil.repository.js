const PatientMovil = require('../../models/mysql/patient_movil.model');

class PatientMovilRepository {
    // 🟢 Crear token
    async createToken(data, transaction) {
        return PatientMovil.create(data, { transaction });
    }

    // 🔍 Buscar token por tenant, paciente y token
    async findByToken(tenantId, patientId, token) {
        return PatientMovil.findOne({
            where: { tenant_id: tenantId, patient_id: patientId, token }
        });
    }

    // 🔴 Eliminar token (borrado físico)
    async deleteToken(record, transaction) {
        return record.destroy({ transaction, force: true });
    }
}

module.exports = new PatientMovilRepository();
