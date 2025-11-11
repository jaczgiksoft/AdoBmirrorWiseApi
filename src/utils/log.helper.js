// src/utils/log.helper.js
const logRepository = require('../modules/log/log.repository');

const createLog = async ({ user_id, user_name, action, module, description, ip, user_agent }) => {
    try {
        await logRepository.createLog({
            user_id,
            user_name,
            action,
            module,
            description,
            ip,
            user_agent
        });
        console.log('✅ Log guardado en Mongo');
    } catch (err) {
        console.error('❌ Error al registrar log:', err);
    }
};

module.exports = { createLog };
