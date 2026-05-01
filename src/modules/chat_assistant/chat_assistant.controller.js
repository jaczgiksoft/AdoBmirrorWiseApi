const chatAssistantService = require('./chat_assistant.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

/**
 * Controller to handle chat assistant messages
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
const askChatAssistant = async (req, res) => {
    try {
        const { message, chat_history } = req.body;
        const tenant_id = req.user?.tenant_id;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const response = await chatAssistantService.processMessage(tenant_id, message, chat_history || []);

        res.json({
            success: true,
            data: response
        });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    askChatAssistant
};
