const cors = require('cors');

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : [];

const allowNullOrigin = process.env.ALLOW_NULL_ORIGIN === 'true';

const corsOptions = {
    origin: (origin, callback) => {
        // 1. Requests sin origen (ej: Postman, curl, o Electron file://)
        if (!origin && allowNullOrigin) {
            return callback(null, true);
        }

        // 2. Si está en la lista blanca, permitir
        if (origin && allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // 3. Rechazar
        return callback(new Error('CORS bloqueado: origen no permitido'));
    },
    credentials: true, // permite cookies/autenticación si se usa
    optionsSuccessStatus: 200, // fallback para navegadores legacy
};

module.exports = cors(corsOptions);
