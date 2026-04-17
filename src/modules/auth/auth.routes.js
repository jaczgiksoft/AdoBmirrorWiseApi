const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { login, loginPatient, unblockUser, me, forgotPassword, resetPassword, refreshToken, logoutAll } = require('./auth.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const BlacklistedToken = require('../../models/mongo/blacklistedToken.model');
const ActiveToken = require('../../models/mongo/activeToken.model');
const { loginLimiter } = require('../../middlewares/rateLimit.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const {
    loginValidator,
    patientLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    refreshTokenValidator
} = require('./auth.validator');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { logger } = require('../../utils/logger');
const { createLog } = require('../../utils/log.helper');

// =====================
// 🔐 LOGIN EMPLEADOS
// =====================
router.post('/login', loginLimiter, loginValidator, validateRequest, login);

// =====================
// 🏥 LOGIN PACIENTES
// =====================
router.post('/login-patient', loginLimiter, patientLoginValidator, validateRequest, loginPatient);

// =====================
// 🔒 LOGOUT (invalida el token actual)
// =====================
router.post('/logout', validateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token no proporcionado' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        await BlacklistedToken.create({
            token: hashedToken,
            user_id: req.user.id,
            reason: 'logout',
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
        });

        await ActiveToken.deleteOne({ user_id: req.user.id, token: hashedToken });

        await createLog({
            user_id: req.user.id,
            user_name: req.user.username,
            action: 'logout',
            module: 'auth',
            description: `Usuario ${req.user.username} cerró sesión`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente',
            tokenInvalidated: true
        });
    } catch (err) {
        logger.error(`Error en logout: ${err.message}`);
        res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
});

// =====================
// 🔓 DESBLOQUEAR USUARIO
// (solo superadmin o con permiso explícito en módulo users)
// =====================
router.delete(
    '/unblock/:username',
    validateToken,
    checkPermissions('delete', 'users'),
    unblockUser
);

// =====================
// 👤 PERFIL DEL USUARIO ACTUAL
// =====================
router.get('/me', validateToken, loadPermissions, me);

// =====================
// 🔑 RECUPERACIÓN DE CONTRASEÑA
// =====================
router.post(
    '/forgot-password',
    forgotPasswordValidator,
    validateRequest,
    forgotPassword
);

router.post(
    '/reset-password',
    resetPasswordValidator,
    validateRequest,
    resetPassword
);

// =====================
// 🔄 REFRESH TOKEN (Ruta pública)
// =====================
router.post(
    '/refresh',
    refreshTokenValidator,
    validateRequest,
    refreshToken
);

// =====================
// 🚪 LOGOUT ALL (Requiere Auth)
// =====================
router.post(
    '/logout-all',
    validateToken,
    logoutAll
);

module.exports = router;
