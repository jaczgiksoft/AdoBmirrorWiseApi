// src/modules/patient_type/patient_type.repository.js
const PatientType = require('../../models/mysql/patient_type.model');
const PatientPatientType = require('../../models/mysql/patient_patient_type.model');
const Patient = require('../../models/mysql/patient.model');

class PatientTypeRepository {

    async findAllByTenant(tenant_id) {
        return PatientType.findAll({
            where: { tenant_id },
            order: [['name', 'ASC']]
        });
    }

    async findById(id, tenant_id) {
        return PatientType.findOne({
            where: { id, tenant_id }
        });
    }

    async create(data, transaction) {
        return PatientType.create(data, { transaction });
    }

    async update(type, data, transaction) {
        return type.update(data, { transaction });
    }

    async softDelete(type, transaction) {
        return type.destroy({ transaction });
    }

    // --- Relaciones N:M ---
    async assignTypeToPatient(patient_id, type_id, tenant_id, transaction) {
        return PatientPatientType.create(
            { patient_id, patient_type_id: type_id, tenant_id },
            { transaction }
        );
    }

    async removeTypeFromPatient(id, transaction) {
        return PatientPatientType.destroy({
            where: { id },
            transaction
        });
    }

    async listTypesOfPatient(patient_id, tenant_id) {
        return PatientPatientType.findAll({
            where: { patient_id, tenant_id },
            include: [{ model: PatientType, as: 'type' }]
        });
    }
}

module.exports = new PatientTypeRepository();
