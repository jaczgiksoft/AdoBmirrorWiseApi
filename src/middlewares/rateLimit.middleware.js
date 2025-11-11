const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { logger } = require('../utils/logger');

const options = {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 5, // Máx 5 intentos
    message: { message: 'Demasiados intentos. Intenta de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false
};

// 🚀 Usar Redis si está configurado
if (process.env.REDIS_HOST) {
    options.store = new RedisStore({
        sendCommand: (...args) => global.redisClient.call(...args)
    });
    logger.info('Rate limiter usando Redis');
}

const loginLimiter = rateLimit(options);

module.exports = { loginLimiter };
