const sequelize = require('../../config/database');
const chatRepository = require('./chat.repository');
const { logger } = require('../../utils/logger');
const { logApiError } = require('../../utils/logApiError');

class ChatService {
    // 📋 Obtener todos los chats del usuario
    async getUserChats(currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');
        return await chatRepository.findUserChats(currentUser.id, currentUser.tenant_id);
    }

    // 📜 Obtener historial de mensajes
    async getHistory(chatId, query, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const chat = await chatRepository.findById(chatId, currentUser.tenant_id);
        if (!chat) throw new Error('Chat no encontrado');

        const isParticipant = await chatRepository.isParticipant(chatId, currentUser.id);
        if (!isParticipant) throw new Error('No autorizado para ver este chat');

        const start = parseInt(query.start) || 0;
        const length = parseInt(query.length) || 50;

        return await chatRepository.findHistory(chatId, start, length);
    }

    // ✉️ Enviar un mensaje
    async sendMessage(body, currentUser, req) {
        const { receiver_id, message } = body;
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const t = await sequelize.transaction();
        try {
            // 1. Obtener o crear chat
            const chat = await chatRepository.findOrCreatePrivateChat(
                currentUser.id,
                receiver_id,
                currentUser.tenant_id,
                t
            );

            // 2. Guardar mensaje
            const newMessage = await chatRepository.saveMessage({
                chat_id: chat.id,
                sender_id: currentUser.id,
                message: message,
                type: 'text'
            }, t);

            await t.commit();

            // 🚀 Emitir por Socket.IO (Tiempo Real)
            if (global.io) {
                // Emitir al canal del chat
                global.io.to(`chat:${chat.id}`).emit('chat:new_message', {
                    chatId: chat.id,
                    message: newMessage,
                    sender: { id: currentUser.id, username: currentUser.username }
                });

                // También podríamos emitir una notificación global al receptor si no está en el chat
                global.io.to(`user:${receiver_id}`).emit('chat:notification', {
                    chatId: chat.id,
                    from: currentUser.username,
                    message: message.substring(0, 50)
                });
            }

            return newMessage;
        } catch (err) {
            await t.rollback();
            logger.error(`Error enviando mensaje: ${err.message}`);
            if (req) await logApiError(req, err);
            throw err;
        }
    }

    // 👁️ Marcar mensajes como leídos
    async markAsRead(chatId, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');
        
        const isParticipant = await chatRepository.isParticipant(chatId, currentUser.id);
        if (!isParticipant) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            await chatRepository.markMessagesAsRead(chatId, currentUser.id, t);
            await t.commit();
            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al marcar como leído: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new ChatService();
