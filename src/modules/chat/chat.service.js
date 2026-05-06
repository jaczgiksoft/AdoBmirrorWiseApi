const sequelize = require('../../config/database');
const chatRepository = require('./chat.repository');
const { logger } = require('../../utils/logger');

class ChatService {
    // 📋 Obtener todos los chats del usuario
    async getChatsByUser(userId, tenantId) {
        return chatRepository.findChatsByUser(userId, tenantId);
    }

    // 📜 Obtener historial de mensajes
    async getChatMessages(chatId, userId, tenantId, params = {}) {
        // Verificar que el chat pertenezca al tenant y el usuario sea participante
        const chat = await chatRepository.findChatById(chatId, tenantId);
        if (!chat) throw new Error('Chat no encontrado');

        const isParticipant = await chatRepository.isParticipant(chatId, userId);
        if (!isParticipant) throw new Error('No tienes permiso para ver este chat');

        const { limit = 50, offset = 0 } = params;
        return chatRepository.findMessagesByChatId(chatId, parseInt(limit), parseInt(offset));
    }

    // ✉️ Enviar un mensaje
    async sendMessage(chatId, senderId, message, type = 'text') {
        const isParticipant = await chatRepository.isParticipant(chatId, senderId);
        if (!isParticipant) throw new Error('No eres participante de este chat');

        const newMessage = await chatRepository.saveMessage({
            chat_id: chatId,
            sender_id: senderId,
            message,
            type
        });

        // Opcional: Actualizar el updatedAt del chat para que aparezca arriba en la lista
        // await EmployeeChat.update({ updatedAt: new Date() }, { where: { id: chatId } });

        return newMessage;
    }

    // 👥 Crear chat grupal
    async createGroupChat(name, participantIds, tenantId, creatorId) {
        const t = await sequelize.transaction();
        try {
            const chat = await chatRepository.createChat({
                tenant_id: tenantId,
                type: 'group',
                name
            }, t);

            // Agregar al creador como admin
            await chatRepository.addParticipant({
                chat_id: chat.id,
                user_id: creatorId,
                role: 'admin',
                joined_at: new Date()
            }, t);

            // Agregar a los demás
            for (const userId of participantIds) {
                if (userId === creatorId) continue;
                await chatRepository.addParticipant({
                    chat_id: chat.id,
                    user_id: userId,
                    role: 'member',
                    joined_at: new Date()
                }, t);
            }

            await t.commit();
            return chat;
        } catch (error) {
            await t.rollback();
            logger.error(`Error al crear chat grupal: ${error.message}`);
            throw error;
        }
    }

    // 🤝 Obtener o crear chat privado
    async getOrCreatePrivateChat(user1Id, user2Id, tenantId) {
        let chat = await chatRepository.findPrivateChat(user1Id, user2Id, tenantId);

        if (!chat) {
            const t = await sequelize.transaction();
            try {
                chat = await chatRepository.createChat({
                    tenant_id: tenantId,
                    type: 'private'
                }, t);

                await chatRepository.addParticipant({
                    chat_id: chat.id,
                    user_id: user1Id,
                    joined_at: new Date()
                }, t);

                await chatRepository.addParticipant({
                    chat_id: chat.id,
                    user_id: user2Id,
                    joined_at: new Date()
                }, t);

                await t.commit();
            } catch (error) {
                await t.rollback();
                logger.error(`Error al crear chat privado: ${error.message}`);
                throw error;
            }
        }

        return chat;
    }

    // 👁️ Marcar mensajes como leídos
    async markMessagesAsRead(chatId, userId) {
        // En una implementación real, marcaríamos todos los mensajes no leídos del chat
        // Por ahora, el repositorio maneja mensaje por mensaje o podemos ampliarlo
    }
}

module.exports = new ChatService();
