require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_USER : process.env.MYSQL_USER,
        password: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_PASSWORD : process.env.MYSQL_PASSWORD,
        database: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_DB : process.env.MYSQL_DB,
        host:     process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_HOST : process.env.MYSQL_HOST,
        port:     process.env.DB_DIALECT === 'mssql' ? (process.env.MSSQL_PORT || 1433) : (process.env.MYSQL_PORT || 3306),
        dialect:  process.env.DB_DIALECT || 'mysql',
        logging: false
    },
    test: {
        username: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_USER : process.env.MYSQL_USER,
        password: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_PASSWORD : process.env.MYSQL_PASSWORD,
        database: process.env.DB_DIALECT === 'mssql' ? (process.env.MSSQL_DB_TEST || 'api_bwise_dental_test') : (process.env.MYSQL_DB_TEST || 'api_bwise_dental_test'),
        host:     process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_HOST : process.env.MYSQL_HOST,
        port:     process.env.DB_DIALECT === 'mssql' ? (process.env.MSSQL_PORT || 1433) : (process.env.MYSQL_PORT || 3306),
        dialect:  process.env.DB_DIALECT || 'mysql',
        logging: false
    },
    production: {
        username: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_USER : process.env.MYSQL_USER,
        password: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_PASSWORD : process.env.MYSQL_PASSWORD,
        database: process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_DB : process.env.MYSQL_DB,
        host:     process.env.DB_DIALECT === 'mssql' ? process.env.MSSQL_HOST : process.env.MYSQL_HOST,
        port:     process.env.DB_DIALECT === 'mssql' ? (process.env.MSSQL_PORT || 1433) : (process.env.MYSQL_PORT || 3306),
        dialect:  process.env.DB_DIALECT || 'mysql',
        logging: false
    }
};
