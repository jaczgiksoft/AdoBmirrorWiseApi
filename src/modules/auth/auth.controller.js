// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

// =====================
// 🔐 LOGIN
// =====================
const login = async (req, res) => {
    try {
        const { tenant, username, password } = req.body;

        const result = await authService.login({
            tenant,
            username,
            password,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token: result.token,
            roles: result.roles,
            permissions: result.permissions
        });
    } catch (err) {
        logger.error(`❌ Error en login: ${err.message}`);
        await logApiError(req, err);
        res.status(401).json({ success: false, message: err.message });
    }
};

// =====================
// 🔓 DESBLOQUEAR USUARIO
// =====================
const unblockUser = async (req, res) => {
    try {
        await authService.unblockUser(req.params.username, req.user, {
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            message: `Usuario '${req.params.username}' desbloqueado correctamente.`
        });
    } catch (err) {
        logger.error(`Error al desbloquear usuario: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// =====================
// 👤 ME (DATOS DEL USUARIO)
// =====================
const me = async (req, res) => {
    try {
        const user = await authService.me(req.user);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        logger.error(`Error en /auth/me: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// =====================
// 🔑 OLVIDÉ CONTRASEÑA
// =====================
const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.status(200).json({
            success: true,
            message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.'
        });
    } catch (err) {
        logger.error(`Error en forgotPassword: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// =====================
// 🔒 RESETEAR CONTRASEÑA
// =====================
const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body);
        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente.'
        });
    } catch (err) {
        logger.error(`Error en resetPassword: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });

    }
};

// =====================
// 🔄 REFRESH TOKEN (Rotación)
// =====================
const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        const result = await authService.refreshToken(
            refresh_token,
            req.ip,
            req.headers['user-agent']
        );

        res.status(200).json({
            success: true,
            message: 'Token refrescado correctamente',
            ...result
        });
    } catch (err) {
        // Warn para no saturar error logs con intentos fallidos triviales
        logger.warn(`Intento de refresh fallido: ${err.message}`);
        res.status(401).json({ success: false, message: err.message });
    }
};

// =====================
// 🚪 LOGOUT ALL (Cerrar todas las sesiones)
// =====================
const logoutAll = async (req, res) => {
    try {
        await authService.revokeAllSessions(req.user.id);

        await createLog({
            user_id: req.user.id,
            user_name: req.user.username,
            action: 'logout_all',
            module: 'auth',
            description: `Usuario ${req.user.username} cerró todas sus sesiones`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            message: 'Todas las sesiones han sido cerradas.'
        });
    } catch (err) {
        logger.error(`Error en logoutAll: ${err.message}`);
        res.status(500).json({ success: false, message: 'Error interno al cerrar sesiones.' });
    }
};

module.exports = {
    login,
    unblockUser,
    me,
    forgotPassword,
    resetPassword,
    refreshToken,
    logoutAll
};
