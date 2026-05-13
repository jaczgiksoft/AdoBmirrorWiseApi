const sequelize = require('../../config/database');
const chatRepository = require('./chat.repository');
const { logger } = require('../../utils/logger');
const { logApiError } = require('../../utils/logApiError');

class ChatService {
    // ─────────────────────────────────────────────────────────────
    // LISTADO Y LECTURA
    // ─────────────────────────────────────────────────────────────

    // 📋 Obtener todos los chats del usuario
    async getUserChats(currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');
        return await chatRepository.findUserChats(currentUser.id, currentUser.tenant_id);
    }

    // 📜 Obtener historial de mensajes (incluye reads por mensaje)
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

    // ─────────────────────────────────────────────────────────────
    // MENSAJES
    // ─────────────────────────────────────────────────────────────

    // ✉️ Enviar un mensaje (privado: receiver_id | grupo: pasa chat_id directo)
    async sendMessage(body, currentUser, req) {
        const { receiver_id, chat_id, message } = body;
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const t = await sequelize.transaction();
        try {
            let chat;

            if (chat_id) {
                // Si viene chat_id, es un envío a un chat existente (grupo o privado)
                chat = await chatRepository.findById(chat_id, currentUser.tenant_id);
                if (!chat) throw new Error('Chat no encontrado');

                const isParticipant = await chatRepository.isParticipant(chat_id, currentUser.id);
                if (!isParticipant) throw new Error('No autorizado para enviar mensajes a este chat');
            } else if (receiver_id) {
                // Si no viene chat_id, debe ser un intento de mensaje privado nuevo
                chat = await chatRepository.findOrCreatePrivateChat(
                    currentUser.id,
                    receiver_id,
                    currentUser.tenant_id,
                    t
                );
            } else {
                throw new Error('Debe proporcionar receiver_id o chat_id');
            }

            // 2. Guardar mensaje
            const newMessage = await chatRepository.saveMessage({
                chat_id: chat.id,
                sender_id: currentUser.id,
                message: message,
                type: 'text'
            }, t);

            // 3. Actualizar actividad del chat
            await chat.update({ updatedAt: new Date() }, { transaction: t });

            await t.commit();

            // 🚀 Emitir por Socket.IO
            if (global.io) {
                // Emitir a la sala del chat
                global.io.to(`chat:${chat.id}`).emit('chat:new_message', {
                    chatId: chat.id,
                    message: newMessage,
                    sender: { id: currentUser.id, username: currentUser.username }
                });

                // Emitir notificación global a los participantes
                const participantIds = await chatRepository.getActiveParticipantIds(chat.id);
                participantIds.forEach(userId => {
                    if (userId !== currentUser.id) {
                        global.io.to(`user:${userId}`).emit('chat:notification', {
                            chatId: chat.id,
                            from: currentUser.username,
                            message: message.substring(0, 50)
                        });
                    }
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

    // ─────────────────────────────────────────────────────────────
    // LECTURA
    // ─────────────────────────────────────────────────────────────

    // 👁️ Marcar mensajes como leídos + emitir evento WebSocket
    async markAsRead(chatId, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const chat = await chatRepository.findById(chatId, currentUser.tenant_id);
        if (!chat) throw new Error('Chat no encontrado');

        const isParticipant = await chatRepository.isParticipant(chatId, currentUser.id);
        if (!isParticipant) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            // Marcar y obtener los mensajes marcados (con sus sender_ids)
            const markedMessages = await chatRepository.markMessagesAsRead(chatId, currentUser.id, t);
            await t.commit();

            // 🚀 Emitir evento messages_seen por Socket.IO
            if (global.io && markedMessages.length > 0) {
                const payload = {
                    chatId: parseInt(chatId),
                    readBy: currentUser.id,
                    readAt: new Date()
                };

                if (chat.type === 'private') {
                    // En privado: notificar al sender original de los mensajes leídos
                    const senderIds = [...new Set(markedMessages.map(m => m.senderId))];
                    senderIds.forEach(senderId => {
                        global.io.to(`user:${senderId}`).emit('messages_seen', payload);
                    });
                } else {
                    // En grupo: notificar a todos los participantes activos
                    const participantIds = await chatRepository.getActiveParticipantIds(chatId);
                    participantIds.forEach(userId => {
                        global.io.to(`user:${userId}`).emit('messages_seen', payload);
                    });
                }
            }

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al marcar como leído: ${err.message}`);
            throw err;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GRUPOS
    // ─────────────────────────────────────────────────────────────

    // 👥 Crear un chat grupal
    async createGroup(body, currentUser) {
        const { name, participant_ids } = body;
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const t = await sequelize.transaction();
        try {
            const chat = await chatRepository.createGroupChat(
                name,
                currentUser.tenant_id,
                currentUser.id,
                participant_ids,
                t
            );

            await t.commit();

            // Notificar a los participantes que fueron agregados a un grupo
            if (global.io) {
                participant_ids.forEach(userId => {
                    global.io.to(`user:${userId}`).emit('chat:group_created', {
                        chatId: chat.id,
                        name: chat.name,
                        createdBy: currentUser.username
                    });
                });
            }

            return chat;
        } catch (err) {
            await t.rollback();
            logger.error(`Error creando grupo: ${err.message}`);
            throw err;
        }
    }

    // ➕ Agregar un participante a un grupo (solo admin)
    async addParticipant(chatId, body, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const chat = await chatRepository.findById(chatId, currentUser.tenant_id);
        if (!chat) throw new Error('Chat no encontrado');
        if (chat.type !== 'group') throw new Error('Solo se pueden agregar participantes en chats de grupo');

        const isAdmin = await chatRepository.isAdmin(chatId, currentUser.id);
        if (!isAdmin) throw new Error('No autorizado: se requiere ser administrador del grupo');

        const { user_id } = body;

        const t = await sequelize.transaction();
        try {
            const participant = await chatRepository.addParticipant(chatId, user_id, t);
            await chat.update({ updatedAt: new Date() }, { transaction: t });
            await t.commit();

            // Notificar al usuario que fue agregado
            if (global.io) {
                global.io.to(`user:${user_id}`).emit('chat:participant_added', {
                    chatId: parseInt(chatId),
                    addedBy: currentUser.username,
                    groupName: chat.name
                });
            }

            return participant;
        } catch (err) {
            await t.rollback();
            logger.error(`Error agregando participante: ${err.message}`);
            throw err;
        }
    }

    // ➖ Eliminar (desactivar) un participante de un grupo (solo admin)
    async removeParticipant(chatId, targetUserId, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const chat = await chatRepository.findById(chatId, currentUser.tenant_id);
        if (!chat) throw new Error('Chat no encontrado');
        if (chat.type !== 'group') throw new Error('Solo se pueden eliminar participantes en chats de grupo');

        // Se permite si es admin del grupo O si se está removiendo a sí mismo
        const isSelf = parseInt(targetUserId) === currentUser.id;
        if (!isSelf) {
            const isAdmin = await chatRepository.isAdmin(chatId, currentUser.id);
            if (!isAdmin) throw new Error('No autorizado: se requiere ser administrador del grupo');
        }

        const t = await sequelize.transaction();
        try {
            await chatRepository.removeParticipant(chatId, targetUserId, t);
            await t.commit();

            // Notificar al grupo que el usuario salió/fue removido
            if (global.io) {
                const remainingIds = await chatRepository.getActiveParticipantIds(chatId);
                remainingIds.forEach(userId => {
                    global.io.to(`user:${userId}`).emit('chat:participant_removed', {
                        chatId: parseInt(chatId),
                        removedUserId: parseInt(targetUserId),
                        removedBy: currentUser.id
                    });
                });
            }

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error eliminando participante: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new ChatService();
