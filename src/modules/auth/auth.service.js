// src/modules/auth/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');

const authRepository = require('./auth.repository');
const patientRepository = require('../patient/patient.repository');
const patientRepresentativeRepository = require('../patient_representative/patient_representative.repository');
const patientHobbyRepository = require('../patient_hobby/patient_hobby.repository');
const RefreshToken = require('../../models/mongo/refreshToken.model');
const { sendMail } = require('../../utils/mail.helper');
const { createLog } = require('../../utils/log.helper');
const { notifyUser } = require('../../utils/notify.helper');
const { logger } = require('../../utils/logger');
const { loggers } = require('winston');

class AuthService {
    // =====================
    // LOGIN
    // =====================
    async login({ tenant, username, password, ip, userAgent }) {
        const now = new Date();

        // 1️⃣ Intentos fallidos
        // const attempt = await authRepository.findLoginAttempt(username);
        // if (attempt?.blocked_until && now < attempt.blocked_until) {
        //     throw new Error('Cuenta bloqueada temporalmente. Intenta más tarde.');
        // }

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

        // 2.1️⃣ Validar perfil completo (Employee vinculado)
        if (!user.employee) {
            throw new Error("Perfil incompleto: El usuario no tiene un empleado asociado.");
        }

        // 3️⃣ Obtener roles y permisos (N:M)
        const roles = await authRepository.findUserRoles(user.id);
        const roleNames = roles.map(r => r.name);
        const roleIds = roles.map(r => r.id); // 🆔 IDs inmutables
        const permissions = await authRepository.findUserPermissions(user.id);

        // 4️⃣ Generar token JWT con múltiples roles
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const tokenPayload = {
            id: user.id,
            username: user.username,
            tenant_id: user.employee.tenant_id,
            tenant_code: user.employee.tenant?.code,
            roles: roleNames,
            role_ids: roleIds, // ✅ Nuevo campo
            is_superadmin: !!user.is_superadmin,
            jti: uuidv4()
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn });

        await authRepository.createActiveToken({
            user_id: user.id,
            token,
            jti: tokenPayload.jti, // 🆔 JTI estricto
            expires_at: new Date(Date.now() + ms(expiresIn))
        });

        // 5️⃣ Generar Refresh Token (Opaco y Rotativo)
        const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
        const refreshFamilyId = uuidv4();
        const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
        const refreshExpiresDate = new Date(Date.now() + ms(refreshExpiresIn));

        await authRepository.createRefreshToken({
            token_hash: RefreshToken.hashToken(refreshTokenRaw),
            user_id: user.id,
            tenant_id: user.employee.tenant_id,
            family_id: refreshFamilyId,
            expires_at: refreshExpiresDate,
            device_info: {
                ip,
                user_agent: userAgent
            }
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
            refresh_token: refreshTokenRaw, // 🎁 Token opaco para el cliente
            roles: roleNames,
            permissions
        };
    }

    // =====================
    // LOGIN PATIENT / REPRESENTATIVE
    // =====================
    async loginPatient({ username, password, ip, userAgent }) {
        const now = new Date();

        const patient = await patientRepository.findByUsername(username);
        const representative = await patientRepresentativeRepository.findByUsernameWithPatients(username);

        let validPatient = false;
        let validRepresentative = false;

        if (patient && patient.password === password) {
            validPatient = true;
        }

        if (representative && representative.password === password) {
            validRepresentative = true;
        }

        if (!validPatient && !validRepresentative) {
            throw new Error('Credenciales incorrectas.');
        }

        const profiles = [];
        let tenantId = null;
        let tenantCode = null;
        let mainUserId = null;

        if (validPatient) {
            if (!patient.can_login) {
                // If they have no valid representative login either, block them
                if (!validRepresentative) {
                    throw new Error('El acceso al portal virtual de este paciente está deshabilitado.');
                }
            } else {
                profiles.push({
                    id: patient.id,
                    name: `${patient.first_name} ${patient.last_name}`,
                    photo: patient.photo_url || null,
                    type: 'self'
                });
                tenantId = patient.tenant_id;
                tenantCode = patient.tenant?.code;
                mainUserId = patient.id;
            }
        }

        if (validRepresentative) {
            if (!representative.can_login) {
                if (!validPatient) {
                    throw new Error('El acceso al portal virtual de este representante está deshabilitado.');
                }
            } else {
                if (!tenantId) {
                    tenantId = representative.tenant_id;
                    tenantCode = representative.tenant?.code;
                    mainUserId = username; // User specified using phone number (username) as ID for representative
                }
                
                if (representative.patients && representative.patients.length > 0) {
                    representative.patients.forEach(p => {
                        // Evitar duplicados si el representante también es el mismo paciente
                        if (!profiles.find(prof => prof.id === p.id)) {
                            profiles.push({
                                id: p.id,
                                name: `${p.first_name} ${p.last_name}`,
                                photo: p.photo_url || null,
                                type: 'represented'
                            });
                        }
                    });
                }
            }
        }

        if (profiles.length === 0) {
            throw new Error('No se encontraron perfiles asociados o el acceso está deshabilitado.');
        }

        const roles = ['patient'];

        // Generar token JWT
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const tokenPayload = {
            id: mainUserId, // Phone number for representative, or patient ID for self
            username: username,
            tenant_id: tenantId,
            tenant_code: tenantCode,
            roles: roles,
            role_ids: [],
            is_superadmin: false,
            jti: uuidv4()
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn });

        await authRepository.createActiveToken({
            user_id: mainUserId,
            user_type: 'patient', // 'patient' because they act in the patient app
            token,
            jti: tokenPayload.jti,
            expires_at: new Date(Date.now() + ms(expiresIn))
        });

        // Generar Refresh Token
        const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
        const refreshFamilyId = uuidv4();
        const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
        const refreshExpiresDate = new Date(Date.now() + ms(refreshExpiresIn));

        await authRepository.createRefreshToken({
            token_hash: RefreshToken.hashToken(refreshTokenRaw),
            user_id: mainUserId,
            user_type: 'patient',
            tenant_id: tenantId,
            family_id: refreshFamilyId,
            expires_at: refreshExpiresDate,
            device_info: {
                ip,
                user_agent: userAgent
            }
        });

        await createLog({
            user_id: mainUserId,
            action: 'login',
            module: 'auth',
            description: `Paciente/Representante ${username} inició sesión`,
            ip,
            user_agent: userAgent
        });

        return {
            message: 'Login exitoso',
            token,
            refresh_token: refreshTokenRaw,
            roles: roles,
            permissions: {},
            profiles,
            user: validPatient ? {
                id: patient.id,
                first_name: patient.first_name,
                last_name: patient.last_name,
                username: patient.username,
                email: patient.email,
                phone_number: patient.phone_number,
                tenant_id: patient.tenant_id,
                first_login: patient.first_login,
                photo_url: patient.photo_url
            } : {
                id: username, // Fallback for representative only
                first_name: representative.full_name,
                last_name: '',
                username: representative.username,
                email: representative.email,
                phone_number: representative.phone,
                tenant_id: representative.tenant_id,
                first_login: representative.first_login,
                photo_url: null
            }
        };
    }

    // =====================
    // REFRESH ACCESS TOKEN (ROTACIÓN)
    // =====================
    async refreshToken(rawRefreshToken, ip, userAgent) {
        const tokenHash = RefreshToken.hashToken(rawRefreshToken);
        const storedToken = await authRepository.findRefreshToken(tokenHash);

        if (!storedToken) {
            throw new Error('Refresh token inválido o expirado.');
        }

        if (storedToken.is_revoked) {
            // 🚨 REUSE DETECTED!
            await authRepository.revokeRefreshTokenFamily(storedToken.family_id);
            logger.error(`🚨 SEGURIDAD: Reuso de Refresh Token detectado. Familia ${storedToken.family_id} revocada.`);
            throw new Error('Sesión comprometida. Por favor inicia sesión nuevamente.');
        }

        if (storedToken.expires_at < new Date()) {
            throw new Error('Refresh token expirado.');
        }

        storedToken.is_revoked = true;
        await storedToken.save();

        const user = await authRepository.findUserById(storedToken.user_id);
        if (!user) throw new Error('Usuario no encontrado.');

        if (!user.employee) {
            throw new Error("Perfil incompleto: El usuario no tiene un empleado asociado.");
        }

        const roles = await authRepository.findUserRoles(user.id);
        const roleNames = roles.map(r => r.name);
        const roleIds = roles.map(r => r.id);

        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const newAccessTokenPayload = {
            id: user.id,
            username: user.username,
            tenant_id: user.employee.tenant_id,
            tenant_code: user.employee.tenant?.code,
            roles: roleNames,
            role_ids: roleIds,
            is_superadmin: !!user.is_superadmin,
            jti: uuidv4()
        };

        const newAccessToken = jwt.sign(newAccessTokenPayload, process.env.JWT_SECRET, { expiresIn });

        await authRepository.createActiveToken({
            user_id: user.id,
            token: newAccessToken,
            jti: newAccessTokenPayload.jti,
            expires_at: new Date(Date.now() + ms(expiresIn))
        });

        const newRefreshTokenRaw = crypto.randomBytes(40).toString('hex');
        const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        await authRepository.createRefreshToken({
            token_hash: RefreshToken.hashToken(newRefreshTokenRaw),
            user_id: user.id,
            tenant_id: user.employee.tenant_id,
            family_id: storedToken.family_id,
            expires_at: new Date(Date.now() + ms(refreshExpiresIn)),
            device_info: { ip, user_agent: userAgent }
        });

        return {
            token: newAccessToken,
            refresh_token: newRefreshTokenRaw
        };
    }

    // =====================
    // REVOKE ALL SESSIONS
    // =====================
    async revokeAllSessions(userId) {
        await authRepository.revokeAllRefreshTokensForUser(userId);
        await authRepository.removeActiveToken({ user_id: userId });
        return true;
    }

    // =====================
    // ME (Perfil del usuario autenticado)
    // =====================
    async me(currentUser, patientId = null) {
        // 1️⃣ Si es un PACIENTE, retornar su perfil clínico full
        if (currentUser.roles?.includes('patient')) {
            const targetId = patientId || currentUser.id;
            const patient = await patientRepository.getFullProfile(targetId, currentUser.tenant_id);
            if (!patient) throw new Error('Paciente no encontrado');

            // Mapear al mismo formato que espera el Front (o similar)
            return {
                id: patient.id,
                username: patient.username,
                email: patient.email,
                firstName: patient.first_name,
                lastName: patient.last_name,
                fullName: `${patient.first_name} ${patient.last_name}`,
                phone: patient.phone_number,
                birthDate: patient.birth_date,
                age: patient.age,
                gender: patient.gender,
                address: patient.address,
                hobbies: patient.hobbies?.map(h => ({ id: h.id, name: h.name })) || [],
                tenant_id: patient.tenant_id,
                roles: ['patient']
            };
        }

        // 2️⃣ Si es un EMPLEADO, usar la lógica existente
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
        const modules = user.employee.tenant?.modules
            ?.filter(m => m.is_enabled)
            .map(m => m.module) || [];

        // 🏢 Información completa del tenant (clínica)
        const tenantInfo = {
            id: user.employee.tenant.id,
            code: user.employee.tenant.code,
            name: user.employee.tenant.name,
            description: user.employee.tenant.description,
            logo_url: user.employee.tenant.logo_url,
            website: user.employee.tenant.website,

            // 📞 Contacto
            contact_name: user.employee.tenant.contact_name,
            contact_email: user.employee.tenant.contact_email,
            contact_phone: user.employee.tenant.contact_phone,

            // 🏠 Dirección
            address: user.employee.tenant.address,
            city: user.employee.tenant.city,
            state: user.employee.tenant.state,
            country: user.employee.tenant.country,
            postal_code: user.employee.tenant.postal_code,

            // 🧾 Datos fiscales
            tax_id: user.employee.tenant.tax_id,
            legal_name: user.employee.tenant.legal_name,
            regime: user.employee.tenant.regime,
            certificate_path: user.employee.tenant.certificate_path,
            key_path: user.employee.tenant.key_path,
            certificate_password: user.employee.tenant.certificate_password,
            cfdi_use: user.employee.tenant.cfdi_use,
            payment_method: user.employee.tenant.payment_method,
            payment_form: user.employee.tenant.payment_form,
            tax_rate: user.employee.tenant.tax_rate,

            // ⚕️ Datos clínicos
            health_registration: user.employee.tenant.health_registration,
            health_registration_expires_at: user.employee.tenant.health_registration_expires_at,

            // ⚙️ Configuración general
            status: user.employee.tenant.status,
            current_subscription_id: user.employee.tenant.current_subscription_id,
            max_users: user.employee.tenant.max_users,
            current_users: user.employee.tenant.current_users,
            timezone: user.employee.tenant.timezone,
            currency: user.employee.tenant.currency,
            exchange_rate: user.employee.tenant.exchange_rate,
            profit_margin: user.employee.tenant.profit_margin,

            // 🕓 Clínica
            opening_hours: user.employee.tenant.opening_hours,
            specialties: user.employee.tenant.specialties,
            number_of_rooms: user.employee.tenant.number_of_rooms,
        };

        // 👤 Información de empleado (si aplica)
        const employee = user.employee
            ? {
                id: user.employee.id,
                first_name: user.employee.first_name,
                last_name: user.employee.last_name,
                second_last_name: user.employee.second_last_name,
                // 💼 Puestos (extraer nombres de la relación N:M)
                position: user.employee.positions?.map(p => p.name).join(', ') || '',
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
    // 👤 GESTIÓN DE HOBBIES (PARA EL PROPIO PACIENTE)
    // =====================
    async addPatientHobby(patientId, name, tenantId) {
        const hobby = await patientHobbyRepository.createHobby({
            patient_id: patientId,
            name: name,
            tenant_id: tenantId
        });
        return { id: hobby.id, name: hobby.name };
    }

    async deletePatientHobby(hobbyId, patientId) {
        // Buscar el hobby y validar que pertenece al paciente logueado
        const hobby = await patientHobbyRepository.findById(hobbyId, null); // Pasamos null a tenantId para buscar solo por ID o validar tenant después
        
        if (!hobby || hobby.patient_id !== patientId) {
            throw new Error('No tienes permiso para eliminar este hobby.');
        }

        await patientHobbyRepository.deleteHobby(hobby);
        return true;
    }

    // =====================
    // FORGOT PASSWORD
    // =====================
    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);
        // Si user.employee existe pero user.employee.tenant es null, lanzará el error.
        if (!user.employee || !user.employee.tenant) {
            throw new Error('Tenant no encontrado');
        }
        // if (!user) throw new Error('Usuario no encontrado.');

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
        <h3>Hola ${user.employee?.first_name || user.username},</h3>
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
            tenant_id: user.employee.tenant_id,
            title: 'Contraseña restablecida',
            message: `El usuario ${user.username} ha restablecido su contraseña exitosamente.`,
            type: 'system'
        });

        return true;
    }
}

module.exports = new AuthService();
