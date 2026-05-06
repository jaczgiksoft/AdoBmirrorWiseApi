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

// 📜 Obtener historial de un chat
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

// 👁️ Marcar como leído
const markAsRead = async (req, res) => {
    try {
        await chatService.markAsRead(req.params.id, req.user);
        res.json({ message: 'Mensajes marcados como leídos' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    getUserChats,
    getHistory,
    sendMessage,
    markAsRead
};
