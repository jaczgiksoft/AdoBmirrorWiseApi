// src/config/mssql.js
const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.MSSQL_DB,
    process.env.MSSQL_USER,
    process.env.MSSQL_PASSWORD,
    {
        host: process.env.MSSQL_HOST,
        port: process.env.MSSQL_PORT || 1433,
        dialect: 'mssql',
        logging: false,
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        }
    }
);

module.exports = sequelize;
