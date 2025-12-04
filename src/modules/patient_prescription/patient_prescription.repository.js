const PatientPrescription = require('../../models/mysql/patient_prescription.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');

class PatientPrescriptionRepository {
    // 🟢 Crear prescripción
    async create(data, transaction) {
        return PatientPrescription.create(data, { transaction });
    }

    // 🟡 Actualizar prescripción
    async update(prescription, data, transaction) {
        return prescription.update(data, { transaction });
    }

    // 🔴 Eliminar prescripción (borrado físico)
    async delete(prescription, transaction) {
        return prescription.destroy({ transaction, force: true });
    }

    // 🔍 Buscar prescripción por ID y tenant
    async findById(id, tenantId) {
        return PatientPrescription.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
            ],
        });
    }

    // 📋 Obtener todas las prescripciones de un paciente
    async findByPatientId(patientId, tenantId) {
        return PatientPrescription.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}

module.exports = new PatientPrescriptionRepository();
