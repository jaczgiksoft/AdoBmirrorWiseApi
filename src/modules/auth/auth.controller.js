// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

// =====================
// LOGIN
// =====================
const login = async (req, res) => {
    try {
        const { tenant, username, password } = req.body; // 👈 incluir tenant
        const result = await authService.login({
            tenant,
            username,
            password,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ message: 'Login exitoso', ...result });
    } catch (err) {
        logger.error(`Error en login: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ message: err.message });
    }
};

// =====================
// UNBLOCK USER
// =====================
const unblockUser = async (req, res) => {
    try {
        await authService.unblockUser(req.params.username, req.user, {
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ message: `Usuario '${req.params.username}' desbloqueado.` });
    } catch (err) {
        logger.error(`Error al desbloquear usuario: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ message: err.message });
    }
};

// =====================
// ME
// =====================
const me = async (req, res) => {
    try {
        const user = await authService.me(req.user);
        res.json(user);
    } catch (err) {
        logger.error(`Error en /auth/me: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ message: err.message });
    }
};

// =====================
// FORGOT PASSWORD
// =====================
const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.json({ message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.' });
    } catch (err) {
        logger.error(`Error en forgotPassword: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ message: err.message });
    }
};

// =====================
// RESET PASSWORD
// =====================
const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body);
        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        logger.error(`Error en resetPassword: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = { login, unblockUser, me, forgotPassword, resetPassword };
