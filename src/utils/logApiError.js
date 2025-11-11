// src/utils/logApiError.js
const apiErrorRepository = require('../modules/log/apiError.repository');

const logApiError = async (req, error, status_code = 500) => {
    try {
        await apiErrorRepository.create({
            user_id: req.user?.id || null,
            route: req.originalUrl,
            method: req.method,
            status_code,
            message: error.message,
            stack: error.stack,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });
    } catch (logErr) {
        console.error('⚠️ Error al guardar en ApiError:', logErr);
    }
};

module.exports = { logApiError };
