// src/modules/auth/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');

const authRepository = require('./auth.repository');
const { sendMail } = require('../../utils/mail.helper');
const { createLog } = require('../../utils/log.helper');
const { notifyUser } = require('../../utils/notify.helper');
const { logger } = require('../../utils/logger');

class AuthService {
    // =====================
    // LOGIN
    // =====================
    async login({ tenant, username, password, ip, userAgent }) {
        const now = new Date();

        // 1️⃣ Intentos fallidos
        const attempt = await authRepository.findLoginAttempt(username);
        if (attempt?.blocked_until && now < attempt.blocked_until) {
            throw new Error('Cuenta bloqueada temporalmente. Intenta más tarde.');
        }

        // 2️⃣ Buscar usuario dentro del tenant
        const user = await authRepository.findUserByTenantAndUsernameOrEmail(tenant, username);
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

        // 3️⃣ Obtener roles y permisos (N:M)
        const roles = await authRepository.findUserRoles(user.id);
        const roleNames = roles.map(r => r.name);
        const permissions = await authRepository.findUserPermissions(user.id);

        // 4️⃣ Generar token JWT con múltiples roles
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const tokenPayload = {
            id: user.id,
            username: user.username,
            tenant_id: user.tenant_id,
            tenant_code: user.tenant?.code,
            roles: roleNames,
            is_superadmin: !!user.is_superadmin,
            jti: uuidv4()
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn });

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
            roles: roleNames,
            permissions
        };
    }

// =====================
// ME (Perfil del usuario autenticado)
// =====================
    async me(currentUser) {
        const user = await authRepository.findUserWithRelations(currentUser.id);
        if (!user) throw new Error('Usuario no encontrado');

        // 🧩 Nombre completo (preferir employee si existe)
        const fullName = user.employee
            ? [
                user.employee.first_name,
                user.employee.last_name,
                user.employee.second_last_name || ''
            ].join(' ').trim()
            : [
                user.first_name,
                user.last_name,
                user.second_last_name || ''
            ].join(' ').trim();

        // 🔒 Combinar permisos de todos los roles (multirol)
        const mergedPermissions = {};
        user.roles?.forEach(role => {
            role.permissions?.forEach(p => {
                if (!mergedPermissions[p.module]) {
                    mergedPermissions[p.module] = {
                        read: p.can_read,
                        write: p.can_write,
                        edit: p.can_edit,
                        delete: p.can_delete
                    };
                } else {
                    mergedPermissions[p.module].read ||= p.can_read;
                    mergedPermissions[p.module].write ||= p.can_write;
                    mergedPermissions[p.module].edit ||= p.can_edit;
                    mergedPermissions[p.module].delete ||= p.can_delete;
                }
            });
        });

        // ⚙️ Módulos habilitados del tenant
        const modules = user.tenant?.modules
            ?.filter(m => m.is_enabled)
            .map(m => m.module) || [];

        // 🏢 Información completa del tenant (clínica)
        const tenantInfo = {
            id: user.tenant.id,
            code: user.tenant.code,
            name: user.tenant.name,
            description: user.tenant.description,
            logo_url: user.tenant.logo_url,
            website: user.tenant.website,

            // 📞 Contacto
            contact_name: user.tenant.contact_name,
            contact_email: user.tenant.contact_email,
            contact_phone: user.tenant.contact_phone,

            // 🏠 Dirección
            address: user.tenant.address,
            city: user.tenant.city,
            state: user.tenant.state,
            country: user.tenant.country,
            postal_code: user.tenant.postal_code,

            // 🧾 Datos fiscales
            tax_id: user.tenant.tax_id,
            legal_name: user.tenant.legal_name,
            regime: user.tenant.regime,
            certificate_path: user.tenant.certificate_path,
            key_path: user.tenant.key_path,
            certificate_password: user.tenant.certificate_password,
            cfdi_use: user.tenant.cfdi_use,
            payment_method: user.tenant.payment_method,
            payment_form: user.tenant.payment_form,
            tax_rate: user.tenant.tax_rate,

            // ⚕️ Datos clínicos
            health_registration: user.tenant.health_registration,
            health_registration_expires_at: user.tenant.health_registration_expires_at,

            // ⚙️ Configuración general
            status: user.tenant.status,
            current_subscription_id: user.tenant.current_subscription_id,
            max_users: user.tenant.max_users,
            current_users: user.tenant.current_users,
            timezone: user.tenant.timezone,
            currency: user.tenant.currency,
            exchange_rate: user.tenant.exchange_rate,
            profit_margin: user.tenant.profit_margin,

            // 🕓 Clínica
            opening_hours: user.tenant.opening_hours,
            specialties: user.tenant.specialties,
            number_of_rooms: user.tenant.number_of_rooms,
        };

        // 👤 Información de empleado (si aplica)
        const employee = user.employee
            ? {
                id: user.employee.id,
                first_name: user.employee.first_name,
                last_name: user.employee.last_name,
                second_last_name: user.employee.second_last_name,
                position: user.employee.position,
                status: user.employee.status
            }
            : null;

        // 🧾 Estructura final del perfil
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: fullName,
            is_superadmin: !!user.is_superadmin,
            roles: user.roles?.map(r => ({ id: r.id, name: r.name })) || [],
            permissions: mergedPermissions,
            tenant: tenantInfo,
            modules,
            employee
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
    // FORGOT PASSWORD
    // =====================
    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) throw new Error('Usuario no encontrado.');

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

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

        const strongPassRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!strongPassRegex.test(new_password)) {
            throw new Error('La contraseña no cumple los requisitos de seguridad.');
        }

        user.password = await bcrypt.hash(new_password, 10);
        await user.save();

        await authRepository.deletePasswordResetToken(tokenDoc._id);

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
