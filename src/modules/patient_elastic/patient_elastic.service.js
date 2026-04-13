const patientElasticRepository = require('./patient_elastic.repository');
const { logger } = require('../../utils/logger');

class PatientElasticService {
    async getPatientElastics(patientId, tenantId) {
        try {
            return await patientElasticRepository.findByPatient(patientId, tenantId);
        } catch (error) {
            logger.error(`[PatientElasticService] Error al obtener elásticos: ${error.message}`);
            throw error;
        }
    }

    async createPatientElastic(data) {
        try {
            return await patientElasticRepository.create(data);
        } catch (error) {
            logger.error(`[PatientElasticService] Error al crear elástico: ${error.message}`);
            throw error;
        }
    }

    async deletePatientElastic(id, tenantId) {
        try {
            return await patientElasticRepository.delete(id, tenantId);
        } catch (error) {
            logger.error(`[PatientElasticService] Error al eliminar elástico: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new PatientElasticService();
