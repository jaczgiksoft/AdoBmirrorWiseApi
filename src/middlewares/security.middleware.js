const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const { logger } = require('../utils/logger');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Demasiadas peticiones desde esta IP. Intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false
});

const applySecurityMiddleware = (app) => {
    const enableRateLimit = process.env.ENABLE_GLOBAL_RATE_LIMIT === 'true';

    // 🛡️ Helmet con CSP mejorada
    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"], // ❌ eliminamos 'unsafe-inline'
                    imgSrc: ["'self'", "data:", "blob:"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" }
        })
    );

    // 🧼 Protección contra XSS y NoSQL injection
    app.use(xssClean());
    app.use(mongoSanitize());

    // 🔒 Oculta tecnología del servidor
    app.disable('x-powered-by');

    // 🚦 Limitador global opcional
    if (enableRateLimit) {
        logger.info('Rate limiting global activado');
        app.use(generalLimiter);
    }
};

module.exports = { applySecurityMiddleware };
