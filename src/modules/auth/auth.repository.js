// src/modules/auth/auth.repository.js
const User = require('../../models/mysql/user.model');
const Role = require('../../models/mysql/role.model');
const Permission = require('../../models/mysql/permission.model');
const Tenant = require('../../models/mysql/tenant.model');
const TenantModule = require('../../models/mysql/tenant_module.model');
const Store = require('../../models/mysql/store.model');

const ActiveToken = require('../../models/mongo/activeToken.model');
const LoginAttempt = require('../../models/mongo/loginAttempt.model');
const PasswordResetToken = require('../../models/mongo/passwordResetToken.model');
const BlacklistedToken = require('../../models/mongo/blacklistedToken.model');

class AuthRepository {
    async findUserByUsername(username) {
        return User.findOne({ where: { username }, include: { model: Role, as: 'role' } });
    }

    async findUserByEmail(email) {
        return User.findOne({ where: { email } });
    }

    async findUserByTenantAndUsername(tenantCode, username) {
        const tenant = await Tenant.findOne({ where: { code: tenantCode } });
        if (!tenant) throw new Error('Tenant no encontrado');

        return User.findOne({
            where: { username, tenant_id: tenant.id },
            include: {
                model: Role,
                as: 'role'
            }
        });
    }

    async findUserById(id) {
        return User.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name', 'requires_cash_session'], // ✅ ahora incluye el flag
                    include: {
                        model: Permission,
                        as: 'permissions',
                        attributes: ['module', 'can_read', 'can_write', 'can_edit', 'can_delete']
                    }
                },
                {
                    model: Tenant,
                    as: 'tenant',
                    attributes: [
                        'id',
                        'name',
                        'logo_url',
                        'currency',
                        'exchange_rate',
                        'timezone'
                    ],
                    include: [
                        { model: TenantModule, as: 'modules', attributes: ['module', 'is_enabled'] }
                    ]
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: [
                        'id',
                        'name',
                        'code',
                        'address',
                        'city',
                        'country',
                        'phone',
                        'email',
                        'status',
                        'currency',
                        'exchange_rate',
                        'timezone',
                        'use_parent_config'
                    ]
                }
            ]
        });
    }

    // Active Tokens
    async createActiveToken(data) {
        return ActiveToken.create(data);
    }
    async removeActiveToken(query) {
        return ActiveToken.deleteOne(query);
    }
    async findActiveTokensByUser(userId) {
        return ActiveToken.find({ user_id: userId });
    }

    // Login Attempts
    async findLoginAttempt(username) {
        return LoginAttempt.findOne({ username });
    }
    async createLoginAttempt(data) {
        return LoginAttempt.create(data);
    }
    async updateLoginAttempt(attempt) {
        return attempt.save();
    }
    async clearLoginAttempts(username) {
        return LoginAttempt.deleteOne({ username });
    }

    // Password Reset
    async createPasswordResetToken(data) {
        return PasswordResetToken.create(data);
    }
    async findPasswordResetToken(hashedToken) {
        return PasswordResetToken.findOne({ token: hashedToken });
    }
    async deletePasswordResetToken(id) {
        return PasswordResetToken.deleteOne({ _id: id });
    }

    // Blacklist
    async blacklistToken(data) {
        return BlacklistedToken.create(data);
    }
    async findBlacklistedToken(token) {
        return BlacklistedToken.findOne({ token });
    }
}

module.exports = new AuthRepository();
