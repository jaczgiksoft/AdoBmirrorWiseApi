const bcrypt = require('bcryptjs');
const User = require('../models/mysql/user.model');
const Role = require('../models/mysql/role.model');
const Tenant = require('../models/mysql/tenant.model');
const { logger } = require('./logger');

const seedAdminUsersClinic = async () => {
    try {
        const tenants = await Tenant.findAll();

        for (const tenant of tenants) {
            // =========================
            // 🔹 Crear roles base mínimos
            // =========================
            const rolesToEnsure = [
                'Administrador General',
                'Director Médico',
                'Recepcionista',
                'Odontólogo'
            ];

            const roleMap = {};
            for (const roleName of rolesToEnsure) {
                const [role] = await Role.findOrCreate({
                    where: { name: roleName, tenant_id: tenant.id },
                    defaults: { description: `Rol ${roleName}`, tenant_id: tenant.id }
                });
                roleMap[roleName] = role;
            }

            const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin123*';
            const hashed = await bcrypt.hash(defaultPassword, 10);

            // =========================
            // 👤 Administrador General
            // =========================
            const usernameAdmin = `admin_${tenant.id}`;
            let adminUser = await User.findOne({ where: { username: usernameAdmin, tenant_id: tenant.id } });
            if (!adminUser) {
                adminUser = await User.create({
                    tenant_id: tenant.id,
                    user_code: `ADM-${tenant.id}`,
                    username: usernameAdmin,
                    email: `admin@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    password: hashed,
                    role_id: roleMap['Administrador General'].id,
                    first_name: 'Admin',
                    last_name: 'Clínica',
                    is_superadmin: true,
                    status: 'active'
                });
                logger.info(`✅ Admin creado para clínica ${tenant.name}`);
            }

            // =========================
            // 🩺 Director Médico
            // =========================
            const usernameDirector = `director_${tenant.id}`;
            const existingDirector = await User.findOne({ where: { username: usernameDirector, tenant_id: tenant.id } });
            if (!existingDirector) {
                await User.create({
                    tenant_id: tenant.id,
                    user_code: `DIR-${tenant.id}`,
                    username: usernameDirector,
                    email: `director@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    password: hashed,
                    role_id: roleMap['Director Médico'].id,
                    first_name: 'Laura',
                    last_name: 'Hernández',
                    status: 'active'
                });
                logger.info(`🩺 Director Médico creado para ${tenant.name}`);
            }

            // =========================
            // 💼 Recepcionista
            // =========================
            const usernameReception = `reception_${tenant.id}`;
            const existingReception = await User.findOne({ where: { username: usernameReception, tenant_id: tenant.id } });
            if (!existingReception) {
                await User.create({
                    tenant_id: tenant.id,
                    user_code: `REC-${tenant.id}`,
                    username: usernameReception,
                    email: `recepcion@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    password: hashed,
                    role_id: roleMap['Recepcionista'].id,
                    first_name: 'Ana',
                    last_name: 'Gómez',
                    status: 'active'
                });
                logger.info(`💼 Recepcionista creada para ${tenant.name}`);
            }

            // =========================
            // 👨‍⚕️ Odontólogo Principal
            // =========================
            const usernameDoctor = `doctor_${tenant.id}`;
            const existingDoctor = await User.findOne({ where: { username: usernameDoctor, tenant_id: tenant.id } });
            if (!existingDoctor) {
                await User.create({
                    tenant_id: tenant.id,
                    user_code: `DOC-${tenant.id}`,
                    username: usernameDoctor,
                    email: `doctor@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    password: hashed,
                    role_id: roleMap['Odontólogo'].id,
                    first_name: 'Carlos',
                    last_name: 'López',
                    status: 'active'
                });
                logger.info(`🦷 Odontólogo principal creado para ${tenant.name}`);
            }

            tenant.current_users += 4; // admin, director, recepcionista, odontólogo
            await tenant.save();
        }
    } catch (err) {
        logger.error(`❌ Error en seedAdminUsersClinic: ${err.message}`);
    }
};

module.exports = seedAdminUsersClinic;
