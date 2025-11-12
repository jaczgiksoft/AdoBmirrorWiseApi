const PatientHobby = require('../../models/mysql/patient_hobby.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');

class PatientHobbyRepository {
    // 🟢 Crear pasatiempo
    async createHobby(data, transaction) {
        return PatientHobby.create(data, { transaction });
    }

    // 🟡 Actualizar pasatiempo
    async updateHobby(hobby, data, transaction) {
        return hobby.update(data, { transaction });
    }

    // 🔴 Eliminar pasatiempo (borrado físico)
    async deleteHobby(hobby, transaction) {
        return hobby.destroy({ transaction, force: true });
    }

    // 🔍 Buscar pasatiempo por ID y tenant
    async findById(id, tenantId) {
        return PatientHobby.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
            ],
        });
    }

    // 📋 Obtener todos los pasatiempos de un paciente
    async findByPatientId(patientId, tenantId) {
        return PatientHobby.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}

module.exports = new PatientHobbyRepository();
