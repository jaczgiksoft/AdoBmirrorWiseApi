// src/utils/seedAdminUsersClinic.js
const bcrypt = require('bcryptjs');
const Tenant = require('../models/mysql/tenant.model');
const Role = require('../models/mysql/role.model');
const User = require('../models/mysql/user.model');
const Employee = require('../models/mysql/employee.model');
const UserRole = require('../models/mysql/user_role.model');
const { logger } = require('./logger');

const seedAdminUsersClinic = async () => {
    try {
        const tenants = await Tenant.findAll({ where: { status: 'active' } });
        const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin123*';
        const hashed = await bcrypt.hash(defaultPassword, 10);

        for (const tenant of tenants) {
            logger.info(`🏢 Creando usuarios base para clínica: ${tenant.name}`);

            // =========================
            // 🔹 Roles base mínimos
            // =========================
            const roleNames = ['Administrador General', 'Director Médico', 'Recepcionista', 'Odontólogo'];
            const roleMap = {};

            for (const name of roleNames) {
                const [role] = await Role.findOrCreate({
                    where: { name, tenant_id: tenant.id },
                    defaults: { tenant_id: tenant.id, name }
                });
                roleMap[name] = role;
            }

            // =========================
            // 👤 Creación de empleados + usuarios
            // =========================
            const usersData = [
                {
                    username: `admin_${tenant.id}`,
                    email: `admin@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    first_name: 'Admin',
                    last_name: 'Clínica',
                    roles: ['Administrador General'],
                    is_superadmin: true,
                    is_appointment_eligible: false
                },
                {
                    username: `director_${tenant.id}`,
                    email: `director@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    first_name: 'Laura',
                    last_name: 'Hernández',
                    roles: ['Director Médico', 'Odontólogo'],
                    is_appointment_eligible: true
                },
                {
                    username: `reception_${tenant.id}`,
                    email: `recepcion@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    first_name: 'Ana',
                    last_name: 'Gómez',
                    roles: ['Recepcionista'],
                    is_appointment_eligible: false
                },
                {
                    username: `doctor_${tenant.id}`,
                    email: `doctor@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    first_name: 'Carlos',
                    last_name: 'López',
                    roles: ['Odontólogo'],
                    is_appointment_eligible: true
                }
            ];

            for (const u of usersData) {
                // Crear empleado (si no existe)
                const [employee] = await Employee.findOrCreate({
                    where: { email: u.email, tenant_id: tenant.id },
                    defaults: {
                        tenant_id: tenant.id,
                        first_name: u.first_name,
                        last_name: u.last_name,
                        position: u.roles.join(', '),
                        is_appointment_eligible: u.is_appointment_eligible,
                        status: 'active'
                    }
                });

                // Crear usuario
                const [user, created] = await User.findOrCreate({
                    where: { employee_id: employee.id },
                    defaults: {
                        employee_id: employee.id,
                        username: u.username,
                        password: hashed,
                        is_superadmin: !!u.is_superadmin,
                        status: 'active'
                    }
                });

                if (created) logger.info(`✅ Usuario creado: ${u.username} (${tenant.name})`);

                // Asignar roles N:M
                const roleLinks = u.roles.map(roleName => ({
                    user_id: user.id,
                    role_id: roleMap[roleName].id
                }));

                await UserRole.bulkCreate(roleLinks, { ignoreDuplicates: true });
            }

            // Actualizar contador del tenant
            tenant.current_users += usersData.length;
            await tenant.save();

            logger.info(`🎯 Usuarios base y roles asignados correctamente para ${tenant.name}`);
        }

        logger.info('🌱 Seed de usuarios administrativos completado correctamente.');
    } catch (err) {
        logger.error(`❌ Error en seedAdminUsersClinic: ${err.message}`, {
            stack: err.stack
        });
    }
};

module.exports = seedAdminUsersClinic;
