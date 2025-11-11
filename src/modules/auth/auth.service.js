// src/modules/auth/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');

const authRepository = require('./auth.repository');
const { sendMail } = require('../../utils/mail.helper');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper'); // ✅ agregado
const storeRepository = require('../store/store.repository');

class AuthService {
    // =====================
    // LOGIN
    // =====================
    async login({ tenant, username, password, ip, userAgent }) {
        const now = new Date();

        const attempt = await authRepository.findLoginAttempt(username);

        if (attempt?.blocked_until && now < attempt.blocked_until) {
            throw new Error('Cuenta bloqueada temporalmente. Intenta más tarde.');
        }

        // 🔹 Buscar usuario dentro del tenant
        const user = await authRepository.findUserByTenantAndUsername(tenant, username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            const maxAttempts = 5;
            const blockTimeMin = 10;

            if (attempt) {
                attempt.attempts += 1;
                attempt.last_attempt = now;
                if (attempt.attempts >= maxAttempts) {
                    attempt.blocked_until = new Date(now.getTime() + blockTimeMin * 60000);
                }
                await authRepository.updateLoginAttempt(attempt);
            } else {
                await authRepository.createLoginAttempt({
                    username,
                    attempts: 1,
                    last_attempt: now,
                    ip,
                    user_agent: userAgent
                });
            }

            throw new Error('Credenciales incorrectas o tenant inválido.');
        }

        await authRepository.clearLoginAttempts(username);

        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = jwt.sign(
            {
                id: user.id,
                user_code: user.user_code,
                username: user.username,
                tenant_id: user.tenant_id,
                tenant_code: user.tenant?.code,
                role: user.role.name,
                role_id: user.role_id,
                is_superadmin: !!user.is_superadmin,
                jti: uuidv4()
            },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        await authRepository.createActiveToken({
            user_id: user.id,
            token,
            expires_at: new Date(Date.now() + ms(expiresIn))
        });

        await createLog({
            user_id: user.id,
            action: 'login',
            module: 'auth',
            description: `Usuario ${user.username} inició sesión`,
            ip,
            user_agent: userAgent
        });

        return {
            message: 'Login exitoso',
            token,
            role_id: user.role_id,
            role: user.role.name
        };
    }

    // =====================
    // UNBLOCK USER
    // =====================
    async unblockUser(username, currentUser, { ip, userAgent }) {
        const deleted = await authRepository.clearLoginAttempts(username);

        if (deleted.deletedCount === 0) {
            throw new Error('No había bloqueo activo para este usuario.');
        }

        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'unblock',
            module: 'auth',
            description: `Desbloqueó al usuario '${username}'`,
            ip,
            user_agent: userAgent
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Usuario desbloqueado',
            message: `El usuario ${username} ha sido desbloqueado por ${currentUser.username}.`,
            type: 'system'
        });

        return true;
    }

    // =====================
    // ME
    // =====================
    async me(currentUser) {
        const user = await authRepository.findUserById(currentUser.id);
        if (!user) throw new Error('Usuario no encontrado');

        const fullName = `${user.first_name} ${user.last_name}${user.second_last_name ? ' ' + user.second_last_name : ''}`;

        const permissions = {};
        user.role.permissions.forEach(p => {
            permissions[p.module] = {
                read: p.can_read,
                write: p.can_write,
                edit: p.can_edit,
                delete: p.can_delete
            };
        });

        const modules = user.tenant?.modules?.filter(m => m.is_enabled).map(m => m.module) || [];

        let stores = [];
        if (user.is_superadmin) {
            const allStores = await storeRepository.findAllByTenant(user.tenant_id);
            stores = allStores.map(s => ({
                id: s.id,
                name: s.name,
                code: s.code,
                address: s.address,
                city: s.city,
                country: s.country,
                phone: s.phone,
                email: s.email,
                status: s.status
            }));
        } else if (user.store) {
            stores = [{
                id: user.store.id,
                name: user.store.name,
                code: user.store.code,
                address: user.store.address,
                city: user.store.city,
                country: user.store.country,
                phone: user.store.phone,
                email: user.store.email,
                status: user.store.status
            }];
        }

        let exchangeRate = null;

        // 🪙 Determinar tipo de cambio efectivo
        if (user.store && !user.store.use_parent_config && user.store.exchange_rate) {
            exchangeRate = user.store.exchange_rate;
        } else if (user.tenant && user.tenant.exchange_rate) {
            exchangeRate = user.tenant.exchange_rate;
        }

        // ✅ Agrega requires_cash_session del rol
        return {
            id: user.id,
            user_code: user.user_code,
            username: user.username,
            full_name: fullName.trim(),
            email: user.email,
            profile_image: user.profile_image,
            role: user.role.name,
            role_id: user.role_id,
            requires_cash_session: !!user.role.requires_cash_session, // 👈 nuevo campo
            tenant: {
                id: user.tenant_id,
                name: user.tenant?.name,
                logo_url: user.tenant?.logo_url
            },
            permissions,
            modules,
            stores,
            config: {
                currency: user.store?.currency || user.tenant?.currency || 'MXN',
                exchange_rate: exchangeRate,
                timezone: user.store?.timezone || user.tenant?.timezone || 'America/Hermosillo'
            }
        };
    }

    // =====================
    // FORGOT PASSWORD
    // =====================
    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) throw new Error('Usuario no encontrado.');

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        await authRepository.createPasswordResetToken({
            user_id: user.id,
            token: rawToken,
            expires_at: expiresAt
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

        await sendMail({
            to: email,
            subject: 'Restablecimiento de contraseña',
            html: `
                <h3>Hola ${user.first_name || user.username},</h3>
                <p>Solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Este enlace expirará en 30 minutos.</p>
            `
        });

        return true;
    }

    // =====================
    // RESET PASSWORD
    // =====================
    async resetPassword({ token, new_password }) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const tokenDoc = await authRepository.findPasswordResetToken(hashedToken);
        if (!tokenDoc || tokenDoc.expires_at < new Date()) {
            throw new Error('Token inválido o expirado.');
        }

        const user = await authRepository.findUserById(tokenDoc.user_id);
        if (!user) throw new Error('Usuario no encontrado.');

        const strongPassRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!strongPassRegex.test(new_password)) {
            throw new Error('La contraseña no cumple los requisitos de seguridad.');
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;
        await user.save();

        await authRepository.deletePasswordResetToken(tokenDoc._id);

        // 🔔 Notificación global
        await notifyUser({
            user_id: user.id,
            tenant_id: user.tenant_id,
            title: 'Contraseña restablecida',
            message: `El usuario ${user.username} ha restablecido su contraseña exitosamente.`,
            type: 'system'
        });

        return true;
    }
}

module.exports = new AuthService();
