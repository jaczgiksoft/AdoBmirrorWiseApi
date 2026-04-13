// src/modules/patient_clinical/patient_clinical.service.js
const patientClinicalRepository = require('./patient_clinical.repository');
const { logger } = require('../../utils/logger');

class PatientClinicalService {
    async getPatientClinicalRecord(patientId, tenantId) {
        try {
            return await patientClinicalRepository.findByPatient(patientId, tenantId);
        } catch (error) {
            logger.error(`[PatientClinicalService] Error al obtener registro clínico: ${error.message}`);
            throw error;
        }
    }

    async upsertPatientClinicalRecord(patientId, tenantId, clinicalData) {
        try {
            return await patientClinicalRepository.upsert(patientId, tenantId, clinicalData);
        } catch (error) {
            logger.error(`[PatientClinicalService] Error al guardar registro clínico: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new PatientClinicalService();
