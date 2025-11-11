const { query } = require('express-validator');

const getLogsValidator = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 500 }).withMessage('El límite debe ser un número entre 1 y 500'),

    query('skip')
        .optional()
        .isInt({ min: 0 }).withMessage('El skip debe ser un número entero mayor o igual a 0'),

    query('desde')
        .optional()
        .isISO8601().withMessage('La fecha desde debe tener un formato válido (YYYY-MM-DD)'),

    query('hasta')
        .optional()
        .isISO8601().withMessage('La fecha hasta debe tener un formato válido (YYYY-MM-DD)')
];

const getRecentLogsValidator = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100')
];

module.exports = {
    getLogsValidator,
    getRecentLogsValidator
};
