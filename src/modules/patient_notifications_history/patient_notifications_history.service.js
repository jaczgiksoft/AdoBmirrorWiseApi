const patientNotificationsHistoryRepository = require('./patient_notifications_history.repository');

class PatientNotificationsHistoryService {
    async getByPatient(patientId, tenantId) {
        return patientNotificationsHistoryRepository.findAllByPatient(patientId, tenantId);
    }

    async getById(id, tenantId) {
        const history = await patientNotificationsHistoryRepository.findById(id, tenantId);
        if (!history) {
            throw new Error('Registro de historial de notificación no encontrado');
        }
        return history;
    }
}

module.exports = new PatientNotificationsHistoryService();
