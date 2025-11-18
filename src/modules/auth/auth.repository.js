const { Op } = require('sequelize');
const User = require('../../models/mysql/user.model');
const Role = require('../../models/mysql/role.model');
const Permission = require('../../models/mysql/permission.model');
const Tenant = require('../../models/mysql/tenant.model');
const TenantModule = require('../../models/mysql/tenant_module.model');
const Employee = require('../../models/mysql/employee.model');
const UserRole = require('../../models/mysql/user_role.model');

const ActiveToken = require('../../models/mongo/activeToken.model');
const LoginAttempt = require('../../models/mongo/loginAttempt.model');
const PasswordResetToken = require('../../models/mongo/passwordResetToken.model');
const BlacklistedToken = require('../../models/mongo/blacklistedToken.model');

class AuthRepository {
    // =====================
    // USERS
    // =====================

    /**
     * Buscar usuario por email
     */
    async findUserByEmail(email) {
        return User.findOne({
            where: { email },
            include: [{ model: Employee, as: 'employee' }]
        });
    }

    /**
     * Buscar usuario dentro de un tenant por username o email
     */
    async findUserByTenantAndUsernameOrEmail(tenantCode, identifier) {
        const tenant = await Tenant.findOne({ where: { code: tenantCode } });
        if (!tenant) throw new Error('Tenant no encontrado');

        return User.findOne({
            where: {
                tenant_id: tenant.id,
                [Op.or]: [{ username: identifier }, { email: identifier }]
            },
            include: [
                { model: Employee, as: 'employee' },
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            attributes: ['module', 'can_read', 'can_write', 'can_edit', 'can_delete']
                        }
                    ]
                },
                {
                    model: Tenant,
                    as: 'tenant',
                    include: [
                        {
                            model: TenantModule,
                            as: 'modules',
                            attributes: ['module', 'is_enabled']
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Buscar usuario por ID (con todas las relaciones necesarias para el perfil)
     */
    async findUserWithRelations(id) {
        return User.findByPk(id, {
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: [
                        'id',
                        'first_name',
                        'last_name',
                        'second_last_name',
                        'position',
                        'status'
                    ]
                },
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            attributes: ['module', 'can_read', 'can_write', 'can_edit', 'can_delete']
                        }
                    ]
                },
                {
                    model: Tenant,
                    as: 'tenant',
                    // ⚙️ Todos los campos relevantes para el perfil del tenant
                    attributes: [
                        'id', 'code', 'name', 'description', 'logo_url', 'website',
                        'contact_name', 'contact_email', 'contact_phone',
                        'address', 'city', 'state', 'country', 'postal_code',
                        'tax_id', 'legal_name', 'regime', 'certificate_path', 'key_path',
                        'certificate_password', 'cfdi_use', 'payment_method', 'payment_form', 'tax_rate',
                        'health_registration', 'health_registration_expires_at',
                        'status', 'current_subscription_id', 'max_users', 'current_users',
                        'timezone', 'currency', 'exchange_rate', 'profit_margin',
                        'opening_hours', 'specialties', 'number_of_rooms'
                    ],
                    include: [
                        {
                            model: TenantModule,
                            as: 'modules',
                            attributes: ['module', 'is_enabled']
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Buscar roles del usuario
     */
    async findUserRoles(userId) {
        return Role.findAll({
            include: [
                {
                    model: User,
                    as: 'users',
                    through: { attributes: [] },
                    where: { id: userId }
                }
            ]
        });
    }

    /**
     * Buscar permisos combinados de todos los roles del usuario
     */
    async findUserPermissions(userId) {
        const roles = await this.findUserRoles(userId);
        const permissions = [];

        for (const role of roles) {
            const roleWithPerms = await Role.findByPk(role.id, {
                include: [{ model: Permission, as: 'permissions' }]
            });
            if (roleWithPerms?.permissions?.length) {
                permissions.push(...roleWithPerms.permissions);
            }
        }

        return permissions;
    }

    /**
     * Buscar usuario por ID simple (para reset, etc.)
     */
    async findUserById(id) {
        return User.findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
    }

    // =====================
    // ACTIVE TOKENS
    // =====================
    async createActiveToken(data) {
        return ActiveToken.create(data);
    }

    async removeActiveToken(query) {
        return ActiveToken.deleteOne(query);
    }

    async findActiveTokensByUser(userId) {
        return ActiveToken.find({ user_id: userId });
    }

    // =====================
    // LOGIN ATTEMPTS
    // =====================
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

    // =====================
    // PASSWORD RESET
    // =====================
    async createPasswordResetToken(data) {
        return PasswordResetToken.create(data);
    }

    async findPasswordResetToken(hashedToken) {
        return PasswordResetToken.findOne({ token: hashedToken });
    }

    async deletePasswordResetToken(id) {
        return PasswordResetToken.deleteOne({ _id: id });
    }

    // =====================
    // BLACKLIST
    // =====================
    async blacklistToken(data) {
        return BlacklistedToken.create(data);
    }

    async findBlacklistedToken(token) {
        return BlacklistedToken.findOne({ token });
    }
}

module.exports = new AuthRepository();
