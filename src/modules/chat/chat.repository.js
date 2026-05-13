const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const EmployeeChat = require('../../models/mysql/employee_chat.model');
const EmployeeChatParticipant = require('../../models/mysql/employee_chat_participant.model');
const ChatMessage = require('../../models/mysql/chat_message.model');
const ChatMessageRead = require('../../models/mysql/chat_message_read.model');
const User = require('../../models/mysql/user.model');
const Employee = require('../../models/mysql/employee.model');

class ChatRepository {
    // ─────────────────────────────────────────────────────────────
    // PRIVADOS
    // ─────────────────────────────────────────────────────────────

    // 🔍 Buscar o crear un chat privado entre dos usuarios
    async findOrCreatePrivateChat(user1Id, user2Id, tenantId, transaction) {
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
            ],
            transaction
        });

        if (commonChat) return commonChat;

        const newChat = await EmployeeChat.create({
            tenant_id: tenantId,
            type: 'private'
        }, { transaction });

        await EmployeeChatParticipant.bulkCreate([
            { chat_id: newChat.id, user_id: user1Id, joined_at: new Date() },
            { chat_id: newChat.id, user_id: user2Id, joined_at: new Date() }
        ], { transaction });

        return newChat;
    }

    // ─────────────────────────────────────────────────────────────
    // GRUPOS
    // ─────────────────────────────────────────────────────────────

    // 👥 Crear un chat grupal
    async createGroupChat(name, tenantId, creatorUserId, participantUserIds, transaction) {
        const newChat = await EmployeeChat.create({
            tenant_id: tenantId,
            type: 'group',
            name
        }, { transaction });

        // El creador es admin; los demás son members
        const participants = [
            { chat_id: newChat.id, user_id: creatorUserId, role: 'admin', joined_at: new Date() },
            ...participantUserIds
                .filter(id => id !== creatorUserId) // evitar duplicado si se incluyó a sí mismo
                .map(id => ({
                    chat_id: newChat.id,
                    user_id: id,
                    role: 'member',
                    joined_at: new Date()
                }))
        ];

        await EmployeeChatParticipant.bulkCreate(participants, { transaction });

        return newChat;
    }

    // ➕ Agregar o reactivar un participante en un grupo
    async addParticipant(chatId, userId, transaction) {
        const existing = await EmployeeChatParticipant.findOne({
            where: { chat_id: chatId, user_id: userId }
        });

        if (existing) {
            // Reactivar si había salido
            await existing.update({ is_active: true, left_at: null, joined_at: new Date() }, { transaction });
            return existing;
        }

        return EmployeeChatParticipant.create({
            chat_id: chatId,
            user_id: userId,
            role: 'member',
            joined_at: new Date(),
            is_active: true
        }, { transaction });
    }

    // ➖ Desactivar un participante (soft delete)
    async removeParticipant(chatId, userId, transaction) {
        return EmployeeChatParticipant.update(
            { is_active: false, left_at: new Date() },
            { where: { chat_id: chatId, user_id: userId }, transaction }
        );
    }

    // 🔑 Verificar si un usuario es admin de un chat
    async isAdmin(chatId, userId) {
        const participant = await EmployeeChatParticipant.findOne({
            where: { chat_id: chatId, user_id: userId, role: 'admin', is_active: true }
        });
        return !!participant;
    }

    // 👥 Obtener IDs de participantes activos de un chat
    async getActiveParticipantIds(chatId) {
        const participants = await EmployeeChatParticipant.findAll({
            where: { chat_id: chatId, is_active: true },
            attributes: ['user_id']
        });
        return participants.map(p => p.user_id);
    }

    // ─────────────────────────────────────────────────────────────
    // MENSAJES
    // ─────────────────────────────────────────────────────────────

    // ✉️ Guardar mensaje
    async saveMessage(data, transaction) {
        return ChatMessage.create(data, { transaction });
    }

    // 📜 Obtener historial paginado (incluye quién ha leído cada mensaje)
    async findHistory(chatId, start = 0, length = 50) {
        return ChatMessage.findAll({
            where: { chat_id: chatId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username'],
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['first_name', 'last_name', 'profile_image']
                        }
                    ]
                },
                {
                    model: ChatMessageRead,
                    as: 'reads',
                    attributes: ['user_id', 'read_at'],
                    required: false
                }
            ],
            offset: start,
            limit: length,
            order: [['createdAt', 'DESC']]
        });
    }

    // 👁️ Marcar mensajes como leídos — retorna los IDs de mensajes marcados
    async markMessagesAsRead(chatId, userId, transaction) {
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

        return messagesToMark.map(m => ({
            messageId: m.id,
            senderId: m.sender_id
        }));
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

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
                id: {
                    [Op.in]: sequelize.literal(`(SELECT chat_id FROM employee_chat_participants WHERE user_id = ${userId} AND is_active = 1)`)
                }
            },
            include: [
                {
                    model: EmployeeChatParticipant,
                    as: 'participants',
                    where: { is_active: true },
                    required: false,
                    attributes: ['user_id', 'role'],
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
            order: [['updatedAt', 'DESC']],
            subQuery: false
        });
    }

    // 🔍 Verificar si un usuario es participante activo
    async isParticipant(chatId, userId) {
        const participant = await EmployeeChatParticipant.findOne({
            where: { chat_id: chatId, user_id: userId, is_active: true }
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
