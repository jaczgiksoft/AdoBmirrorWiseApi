const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const EmployeeChat = require('../../models/mysql/employee_chat.model');
const EmployeeChatParticipant = require('../../models/mysql/employee_chat_participant.model');
const ChatMessage = require('../../models/mysql/chat_message.model');
const ChatMessageRead = require('../../models/mysql/chat_message_read.model');
const User = require('../../models/mysql/user.model');
const Employee = require('../../models/mysql/employee.model');

class ChatRepository {
    // 🔍 Buscar o crear un chat privado entre dos usuarios
    async findOrCreatePrivateChat(user1Id, user2Id, tenantId, transaction) {
        // 1. Buscar los chats donde participa el usuario 1
        const chatsUser1 = await EmployeeChatParticipant.findAll({
            where: { user_id: user1Id },
            attributes: ['chat_id']
        });
        const chatIdsUser1 = chatsUser1.map(c => c.chat_id);

        // 2. Buscar entre esos chats uno que sea privado y donde también participe el usuario 2
        const commonChat = await EmployeeChat.findOne({
            where: {
                id: chatIdsUser1,
                tenant_id: tenantId,
                type: 'private'
            },
            include: [
                {
                    model: EmployeeChatParticipant,
                    as: 'participants',
                    where: { user_id: user2Id },
                    required: true
                }
            ],
            transaction
        });

        if (commonChat) return commonChat;

        // Si no existe, crear nuevo
        const newChat = await EmployeeChat.create({
            tenant_id: tenantId,
            type: 'private'
        }, { transaction });

        await EmployeeChatParticipant.bulkCreate([
            { chat_id: newChat.id, user_id: user1Id },
            { chat_id: newChat.id, user_id: user2Id }
        ], { transaction });

        return newChat;
    }

    // ✉️ Guardar mensaje
    async saveMessage(data, transaction) {
        return ChatMessage.create(data, { transaction });
    }

    // 📜 Obtener historial paginado
    async findHistory(chatId, start = 0, length = 50) {
        return ChatMessage.findAll({
            where: { chat_id: chatId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                }
            ],
            offset: start,
            limit: length,
            order: [['createdAt', 'DESC']]
        });
    }

    // 👁️ Marcar mensajes como leídos
    async markMessagesAsRead(chatId, userId, transaction) {
        // Obtener mensajes del chat que no son del usuario y no han sido leídos por él
        const unreadMessages = await ChatMessage.findAll({
            where: {
                chat_id: chatId,
                sender_id: { [Op.ne]: userId }
            },
            include: [
                {
                    model: ChatMessageRead,
                    as: 'reads',
                    where: { user_id: userId },
                    required: false
                }
            ]
        });

        const messagesToMark = unreadMessages.filter(m => !m.reads || m.reads.length === 0);

        if (messagesToMark.length > 0) {
            await ChatMessageRead.bulkCreate(
                messagesToMark.map(m => ({
                    message_id: m.id,
                    user_id: userId,
                    read_at: new Date()
                })),
                { transaction }
            );
        }
    }

    // 📋 Listar chats del usuario con el último mensaje
    async findUserChats(userId, tenantId) {
        return EmployeeChat.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM chat_messages AS m
                            LEFT JOIN chat_messages_read AS r ON m.id = r.message_id AND r.user_id = ${userId}
                            WHERE m.chat_id = EmployeeChat.id
                              AND m.sender_id != ${userId}
                              AND r.id IS NULL
                        )`),
                        'unreadCount'
                    ]
                ]
            },
            where: { 
                tenant_id: tenantId,
                // Filtrar chats donde el usuario participa
                id: {
                    [Op.in]: sequelize.literal(`(SELECT chat_id FROM employee_chat_participants WHERE user_id = ${userId})`)
                }
            },
            include: [
                {
                    model: EmployeeChatParticipant,
                    as: 'participants',
                    attributes: ['user_id'],
                    include: [
                        { 
                            model: User, 
                            as: 'user', 
                            attributes: ['id', 'username'],
                            include: [
                                { 
                                    model: Employee, 
                                    as: 'employee', 
                                    attributes: ['first_name', 'last_name', 'profile_image'] 
                                }
                            ]
                        }
                    ]
                },
                {
                    model: ChatMessage,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                    include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }]
                }
            ],
            // Ordenar por la fecha de actualización del chat (actividad más reciente)
            order: [['updatedAt', 'DESC']],
            subQuery: false
        });
    }

    // 🔍 Verificar si un usuario es participante
    async isParticipant(chatId, userId) {
        const participant = await EmployeeChatParticipant.findOne({
            where: { chat_id: chatId, user_id: userId }
        });
        return !!participant;
    }

    // 🔍 Buscar chat por ID
    async findById(id, tenantId) {
        return EmployeeChat.findOne({
            where: { id, tenant_id: tenantId }
        });
    }
}

module.exports = new ChatRepository();
