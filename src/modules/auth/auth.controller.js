// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const patientElasticService = require('../patient_elastic/patient_elastic.service');
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
// 🏥 LOGIN PACIENTES
// =====================
const loginPatient = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await authService.loginPatient({
            username,
            password,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            message: 'Login de paciente exitoso',
            token: result.token,
            refresh_token: result.refresh_token,
            roles: result.roles,
            permissions: result.permissions,
            profiles: result.profiles,
            user: result.user
        });
    } catch (err) {
        logger.error(`❌ Error en login paciente: ${err.message}`);
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
        const patientId = req.query.patientId;
        const user = await authService.me(req.user, patientId);
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
// 🎯 AGREGAR HOBBY (PACIENTE)
// =====================
const addMyHobby = async (req, res) => {
    try {
        const patientId = req.body.patientId || req.user.id;
        const hobby = await authService.addPatientHobby(patientId, req.body.name, req.user.tenant_id);
        res.status(201).json({ success: true, data: hobby });
    } catch (err) {
        logger.error(`Error en addMyHobby: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// =====================
// 🗑️ ELIMINAR HOBBY (PACIENTE)
// =====================
const deleteMyHobby = async (req, res) => {
    try {
        const patientId = req.query.patientId || req.user.id;
        await authService.deletePatientHobby(req.params.id, patientId);
        res.status(200).json({ success: true, message: 'Hobby eliminado correctamente' });
    } catch (err) {
        logger.error(`Error en deleteMyHobby: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// =====================
// 🎯 OBTENER MIS ELÁSTICOS (PACIENTE)
// =====================
const getMyElastics = async (req, res) => {
    try {
        const elastics = await patientElasticService.getPatientElastics(req.user.id, req.user.tenant_id);
        res.status(200).json({ success: true, data: elastics });
    } catch (err) {
        logger.error(`Error en getMyElastics: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
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
    loginPatient,
    unblockUser,
    me,
    addMyHobby,
    deleteMyHobby,
    getMyElastics,
    forgotPassword,
    resetPassword,
    refreshToken,
    logoutAll
};
