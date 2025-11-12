const PatientConversation = require('../../models/mysql/patient_conversation.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');
const User = require('../../models/mysql/user.model');

class PatientConversationRepository {
    // 🟢 Crear conversación
    async createConversation(data, transaction) {
        return PatientConversation.create(data, { transaction });
    }

    // 🟡 Actualizar conversación
    async updateConversation(conversation, data, transaction) {
        return conversation.update(data, { transaction });
    }

    // 🔴 Eliminar conversación (borrado físico)
    async deleteConversation(conversation, transaction) {
        return conversation.destroy({ transaction, force: true });
    }

    // 🔍 Buscar conversación por ID y tenant
    async findById(id, tenantId) {
        return PatientConversation.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
                { model: User, as: 'author', attributes: ['id', 'username', 'email'] }
            ]
        });
    }

    // 📋 Obtener todas las conversaciones de un paciente
    async findByPatientId(patientId, tenantId) {
        return PatientConversation.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
}

module.exports = new PatientConversationRepository();
