const { Op } = require('sequelize');
const EmployeeChat = require('../../models/mysql/employee_chat.model');
const EmployeeChatParticipant = require('../../models/mysql/employee_chat_participant.model');
const ChatMessage = require('../../models/mysql/chat_message.model');
const ChatMessageRead = require('../../models/mysql/chat_message_read.model');
const User = require('../../models/mysql/user.model');

class ChatRepository {
    // 🔍 Buscar o crear un chat privado entre dos usuarios
    async findOrCreatePrivateChat(user1Id, user2Id, tenantId, transaction) {
        // Buscar si ya existe un chat privado donde ambos participen
        const existingChat = await EmployeeChat.findOne({
            where: {
                tenant_id: tenantId,
                type: 'private'
            },
            include: [
                {
                    model: EmployeeChatParticipant,
                    as: 'participants',
                    where: { user_id: [user1Id, user2Id] },
                    required: true
                }
            ],
            group: ['EmployeeChat.id'],
            having: sequelize.literal(`COUNT(DISTINCT participants.user_id) = 2`)
        });

        // NOTA: El literal anterior asume que 'sequelize' está disponible o usa la instancia del modelo.
        // Mejor hacerlo con una subconsulta o buscando los chats del usuario 1 y filtrando por usuario 2.
        
        // Refactor para ser más robusto:
        const chatsUser1 = await EmployeeChatParticipant.findAll({
            where: { user_id: user1Id },
            attributes: ['chat_id']
        });
        const chatIdsUser1 = chatsUser1.map(c => c.chat_id);

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
            ]
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
            where: { tenant_id: tenantId },
            include: [
                {
                    model: EmployeeChatParticipant,
                    as: 'participants',
                    where: { user_id: userId },
                    required: true
                },
                {
                    model: EmployeeChatParticipant,
                    as: 'participants',
                    attributes: ['user_id'],
                    include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
                },
                {
                    model: ChatMessage,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                    include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }]
                }
            ],
            order: [[{ model: ChatMessage, as: 'messages' }, 'createdAt', 'DESC']]
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
