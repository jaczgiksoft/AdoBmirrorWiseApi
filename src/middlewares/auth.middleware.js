const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/mongo/blacklistedToken.model');
const ActiveToken = require('../models/mongo/activeToken.model');
const { logger } = require('../utils/logger');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
        logger.warn(`Auth fallo: Token no proporcionado. IP: ${req.ip}`);
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            logger.warn(`Auth fallo: Token expirado. IP: ${req.ip}`);
            return res.status(401).json({ message: 'Token expirado' });
        }
        logger.error(`Auth fallo: Token inválido. IP: ${req.ip}`);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

const validateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        logger.warn(`Auth fallo: Token no proporcionado. IP: ${req.ip}`);
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        // 1. Revisar blacklist (el modelo se encarga del hash si aplica)
        const blacklisted = await BlacklistedToken.findOne({ token });
        if (blacklisted) {
            logger.warn(`Auth fallo: Token en blacklist. IP: ${req.ip}`);
            return res.status(401).json({ message: 'Token inválido o expirado (blacklist)' });
        }

        // 2. Decodificar JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

        // 3. Buscar todas las sesiones activas del usuario
        const actives = await ActiveToken.find({ user_id: decoded.id });

        // 4. Validar si alguna coincide (usa compareToken)
        const valid = actives.some(active => active.compareToken(token));

        if (!valid) {
            logger.warn(`Auth fallo: Sesión inválida. Usuario: ${decoded.id}, IP: ${req.ip}`);
            return res.status(401).json({ message: 'Sesión no válida o reemplazada' });
        }

        // 5. Adjuntar usuario al request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            logger.warn(`Auth fallo: Token expirado. IP: ${req.ip}`);
            return res.status(401).json({ message: 'Token expirado' });
        }
        logger.error(`Auth fallo: ${error.message}. IP: ${req.ip}`);
        return res.status(403).json({ message: 'Token inválido' });
    }
};

module.exports = { verifyToken, validateToken };
