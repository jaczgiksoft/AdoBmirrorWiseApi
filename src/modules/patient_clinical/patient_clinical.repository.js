// src/modules/patient_clinical/patient_clinical.repository.js
const PatientClinicalRecord = require('../../models/mysql/patient_clinical_record.model');

class PatientClinicalRepository {
    async findByPatient(patientId, tenantId) {
        return await PatientClinicalRecord.findOne({
            where: {
                patient_id: patientId,
                tenant_id: tenantId
            }
        });
    }

    async upsert(patientId, tenantId, clinicalData) {
        let record = await this.findByPatient(patientId, tenantId);

        if (record) {
            return await record.update({ clinical_data: clinicalData });
        } else {
            return await PatientClinicalRecord.create({
                patient_id: patientId,
                tenant_id: tenantId,
                clinical_data: clinicalData
            });
        }
    }
}

module.exports = new PatientClinicalRepository();
