// server.js
require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const bootstrap = require('./src/bootstrap');
const { logger } = require('./src/utils/logger');

// 🚦 Validación estricta de configuración crítica
let requiredEnv = ['JWT_SECRET', 'MONGO_URI']; // comunes

if (process.env.DB_DIALECT === 'mssql') {
    requiredEnv.push('MSSQL_DB', 'MSSQL_USER', 'MSSQL_PASSWORD');
} else {
    requiredEnv.push('MYSQL_DB', 'MYSQL_USER', 'MYSQL_PASSWORD');
}

requiredEnv.forEach((key) => {
    if (process.env[key] === undefined) {
        logger.error(`❌ ERROR: Falta configuración en .env → ${key}`);
        process.exit(1);
    }
});

// Validar DB_SYNC_MODE
const validSyncModes = ['none', 'alter', 'force'];
if (!validSyncModes.includes(process.env.DB_SYNC_MODE || 'none')) {
    logger.error('❌ ERROR: DB_SYNC_MODE inválido, use: none | alter | force');
    process.exit(1);
}

// 🌍 Entorno activo
logger.info(`🌐 Iniciando servidor en modo: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🗄️ Usando motor de base de datos: ${process.env.DB_DIALECT || 'mysql'}`);

// 🚀 Arrancar bootstrap
bootstrap();
