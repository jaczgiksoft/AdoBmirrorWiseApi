const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { login, unblockUser, me, forgotPassword, resetPassword } = require('./auth.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const BlacklistedToken = require('../../models/mongo/blacklistedToken.model');
const ActiveToken = require('../../models/mongo/activeToken.model');
const { loginLimiter } = require('../../middlewares/rateLimit.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('./auth.validator');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { logger } = require('../../utils/logger');
const { createLog } = require('../../utils/log.helper');

// 🔑 Login
router.post('/login', loginLimiter, loginValidator, validateRequest, login);

// 🔒 Logout (invalida solo el token actual)
router.post('/logout', validateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

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

        res.json({ message: 'Sesión cerrada exitosamente', tokenInvalidated: true });
    } catch (err) {
        logger.error(`Error en logout: ${err.message}`);
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
});

// 🔓 Unblock user (solo superadmin o con permiso explícito)
router.delete('/unblock/:username', validateToken, checkPermissions('delete', 'users'), unblockUser);

// 👤 Perfil autenticado
router.get('/me', validateToken, loadPermissions, me);

// 🔑 Reset password flow
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);

module.exports = router;
