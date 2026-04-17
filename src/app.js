// src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { applySecurityMiddleware } = require('./middlewares/security.middleware');
const errorHandler = require('./middlewares/error.middleware');
const routes = require('./routes');
const { logger } = require('./utils/logger');
const path = require('path');

const app = express();

// 🔐 Seguridad centralizada (helmet, xss-clean, rate limit, mongo-sanitize, etc.)
applySecurityMiddleware(app);

// 🌐 Configuración de CORS dinámica
const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

const allowNullOrigin = process.env.ALLOW_NULL_ORIGIN === 'true';

app.use(cors({
    origin: (origin, callback) => {
        // 1. Si no hay configuración, permitir todo
        if (corsOrigins.length === 0) return callback(null, true);

        // 2. Permitir origen = null solo si está habilitado (Electron, Postman)
        if (!origin && allowNullOrigin) {
            return callback(null, true);
        }

        // 3. Permitir si el origin está en la whitelist
        if (origin && corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        // 4. Rechazar
        logger.warn(`❌ Bloqueado intento de acceso CORS desde: ${origin}`);
        return callback(new Error('No autorizado por CORS'));
    },
    credentials: true
}));

// 📜 Logs HTTP solo si no estamos en test
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev', {
        stream: {
            write: (msg) => logger.http(msg.trim())
        }
    }));
}

// 📦 Middlewares estándar
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 📂 Servir archivos estáticos desde /uploads
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // o tu dominio frontend
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads')));
app.use("/downloads", require("express").static("downloads"));
// 🔀 Rutas
app.use('/api', routes);

// ✔ Ruta base
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando 🎉' });
});

// ❌ Ruta no encontrada
app.use((req, res, next) => {
    logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// 🛠️ Middleware global de errores
app.use(errorHandler);

module.exports = app;
