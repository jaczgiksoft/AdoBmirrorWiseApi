const chatService = require('./chat.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 📋 Obtener chats del usuario
const getUserChats = async (req, res) => {
    try {
        const chats = await chatService.getUserChats(req.user);
        res.json(chats);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📜 Obtener historial de un chat (incluye reads por mensaje)
const getHistory = async (req, res) => {
    try {
        const history = await chatService.getHistory(req.params.id, req.query, req.user);
        res.json(history);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// ✉️ Enviar un mensaje
const sendMessage = async (req, res) => {
    try {
        const result = await chatService.sendMessage(req.body, req.user, req);
        res.status(201).json({ message: 'Mensaje enviado', data: result });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 👁️ Marcar como leído (emite messages_seen por WebSocket)
const markAsRead = async (req, res) => {
    try {
        await chatService.markAsRead(req.params.id, req.user);
        res.json({ message: 'Mensajes marcados como leídos' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 👥 Crear grupo
const createGroup = async (req, res) => {
    try {
        const group = await chatService.createGroup(req.body, req.user);
        res.status(201).json({ message: 'Grupo creado', data: group });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// ➕ Agregar participante a un grupo
const addParticipant = async (req, res) => {
    try {
        const participant = await chatService.addParticipant(req.params.id, req.body, req.user);
        res.status(201).json({ message: 'Participante agregado', data: participant });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// ➖ Eliminar participante de un grupo
const removeParticipant = async (req, res) => {
    try {
        await chatService.removeParticipant(req.params.id, req.params.userId, req.user);
        res.json({ message: 'Participante eliminado del grupo' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    getUserChats,
    getHistory,
    sendMessage,
    markAsRead,
    createGroup,
    addParticipant,
    removeParticipant
};
