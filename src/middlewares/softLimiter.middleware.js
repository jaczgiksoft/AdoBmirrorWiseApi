const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { logger } = require('../utils/logger');

const options = {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10,
    message: { message: 'Has excedido el límite de uso. Intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false
};

if (process.env.REDIS_HOST) {
    options.store = new RedisStore({
        sendCommand: (...args) => global.redisClient.call(...args)
    });
    logger.info('Soft limiter usando Redis');
}

const softLimiter = rateLimit(options);

module.exports = { softLimiter };
