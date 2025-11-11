// src/config/database.js
const mysql = require('./mysql');
const mssql = require('./mssql');

// Lee el motor desde .env
const dialect = process.env.DB_DIALECT || 'mysql';
console.log("🚀 DB_DIALECT:", process.env.DB_DIALECT);

// Exporta la conexión correspondiente
const sequelize = dialect === 'mssql' ? mssql : mysql;

module.exports = sequelize;
