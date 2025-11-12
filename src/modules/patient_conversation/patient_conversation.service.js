const sequelize = require('../../config/database');
const patientConversationRepository = require('./patient_conversation.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class PatientConversationService {
    // 🟢 Crear nueva conversación
    async createPatientConversation(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant en el usuario');

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['tenant_id', 'patient_id', 'user_id', 'title', 'content'];
            const cleanData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));

            cleanData.tenant_id = currentUser.tenant_id;
            cleanData.user_id = currentUser.id; // el autor siempre será el usuario autenticado

            const newConversation = await patientConversationRepository.createConversation(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_conversations',
                description: `Conversación creada para paciente #${newConversation.patient_id}: ${newConversation.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación informativa
            await notifyUser({
                user_id: currentUser.id,
                title: 'Nueva conversación registrada',
                message: `${currentUser.username} inició una conversación: "${newConversation.title}".`,
                type: 'info'
            });

            return newConversation;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear conversación: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar conversación
    async updatePatientConversation(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const conversation = await patientConversationRepository.findById(id, currentUser.tenant_id);
            if (!conversation) throw new Error('Conversación no encontrada');

            // Solo el autor puede editar
            if (conversation.user_id !== currentUser.id) {
                throw new Error('No tienes permiso para editar esta conversación');
            }

            const allowedFields = ['title', 'content'];
            const cleanData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));

            await patientConversationRepository.updateConversation(conversation, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_conversations',
                description: `Conversación actualizada: ${conversation.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return conversation;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar conversación: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar conversación
    async deletePatientConversation(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const conversation = await patientConversationRepository.findById(id, currentUser.tenant_id);
            if (!conversation) throw new Error('Conversación no encontrada');

            // Solo el autor puede eliminar
            if (conversation.user_id !== currentUser.id) {
                throw new Error('No tienes permiso para eliminar esta conversación');
            }

            await patientConversationRepository.deleteConversation(conversation, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_conversations',
                description: `Conversación eliminada: ${conversation.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar conversación: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todas las conversaciones de un paciente
    async getConversationsByPatientId(patientId, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        return await patientConversationRepository.findByPatientId(patientId, currentUser.tenant_id);
    }

    // 🔍 Obtener una conversación específica
    async getConversationById(id, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const conversation = await patientConversationRepository.findById(id, currentUser.tenant_id);
        if (!conversation) throw new Error('Conversación no encontrada');
        return conversation;
    }
}

module.exports = new PatientConversationService();
