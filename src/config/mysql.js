const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        timezone: '-07:00', // Nogales, Sonora (UTC-7 sin DST)
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.MYSQL_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
        }
    }
);

sequelize.authenticate()
    .then(() => logger.info('🟢 MySQL conectado'))
    .catch(err => {
        logger.error(`🔴 Error conectando a MySQL: ${err.message}`);
        process.exit(1);
    });

module.exports = sequelize;
