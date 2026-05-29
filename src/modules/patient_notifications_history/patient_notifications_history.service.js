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

    async markAsRead(id, tenantId) {
        const [affected] = await patientNotificationsHistoryRepository.markAsRead(id, tenantId);
        if (affected === 0) {
            throw new Error('Registro no encontrado o ya estaba marcado como leído');
        }
        return this.getById(id, tenantId);
    }

    async markAllAsRead(patientId, tenantId) {
        const [affected] = await patientNotificationsHistoryRepository.markAllAsRead(patientId, tenantId);
        return { affected };
    }
}

module.exports = new PatientNotificationsHistoryService();
