const ApiError = require('../models/mongo/apiError.model');
const errorHandler = async (err, req, res, next) => {
    const statusCode = err.status || 500;
    const env = process.env.NODE_ENV || 'development';

    console.error('💥 Error capturado por middleware:', err);

    // Intentar guardar el error en Mongo
    try {
        await ApiError.create({
            user_id: req.user?.id || null,
            route: req.originalUrl,
            method: req.method,
            status_code: statusCode,
            message: err.message,
            stack: err.stack,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });
    } catch (logErr) {
        console.error('⚠️ Error al guardar en ApiError:', logErr);
    }

    // En desarrollo, mostrar más detalles
    res.status(statusCode).json({
        message: env === 'development' ? err.message : 'Ocurrió un error inesperado.',
        ...(env === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
