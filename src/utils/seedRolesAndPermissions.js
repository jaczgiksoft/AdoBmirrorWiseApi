const Role = require('../models/mysql/role.model');
const Permission = require('../models/mysql/permission.model');
const Tenant = require('../models/mysql/tenant.model');
const TenantModule = require('../models/mysql/tenant_module.model');
const { logger } = require('./logger');

const seedRolesAndPermissionsClinic = async () => {
    try {
        const tenants = await Tenant.findAll();

        for (const tenant of tenants) {
            // 🧩 Roles base de clínica dental
            const rolesBase = [
                // Administración
                'Administrador General',
                'Director Médico',
                'Coordinador Clínico',
                'Recepcionista',
                'Asistente Dental',

                // Profesionales
                'Odontólogo',
                'Higienista',
                'Especialista',

                // Finanzas y administración
                'Contador',
                'Auxiliar Administrativo',

                // Soporte y mantenimiento
                'Técnico de Sistemas',
                'Limpieza'
            ];

            // Recuperar módulos habilitados para este tenant
            const tenantModules = await TenantModule.findAll({
                where: { tenant_id: tenant.id, is_enabled: true }
            });
            const enabledModules = tenantModules.map(m => m.module);

            for (const roleName of rolesBase) {
                let role = await Role.findOne({ where: { name: roleName, tenant_id: tenant.id } });

                if (!role) {
                    role = await Role.create({
                        name: roleName,
                        tenant_id: tenant.id,
                        description: `Rol clínico: ${roleName}`
                    });

                    logger.info(`✅ Rol creado: ${roleName} en clínica ${tenant.name}`);
                }

                // 🔒 Permisos base según el rol
                for (const moduleName of enabledModules) {
                    const exists = await Permission.findOne({
                        where: { role_id: role.id, module: moduleName }
                    });

                    if (!exists) {
                        let perms = { can_read: true, can_write: false, can_edit: false, can_delete: false };

                        if (roleName === 'Administrador General' || roleName === 'Director Médico') {
                            perms = { can_read: true, can_write: true, can_edit: true, can_delete: true };
                        } else if (roleName === 'Odontólogo' || roleName === 'Especialista') {
                            perms = { can_read: true, can_write: true, can_edit: true, can_delete: false };
                        } else if (roleName === 'Recepcionista') {
                            perms = { can_read: true, can_write: true, can_edit: false, can_delete: false };
                        } else if (roleName === 'Asistente Dental' || roleName === 'Higienista') {
                            perms = { can_read: true, can_write: true, can_edit: false, can_delete: false };
                        }

                        await Permission.create({
                            role_id: role.id,
                            tenant_id: tenant.id,
                            module: moduleName,
                            ...perms
                        });

                        logger.info(`🧩 Permisos creados: Rol ${roleName} → Módulo ${moduleName}`);
                    }
                }
            }
        }
    } catch (err) {
        logger.error(`❌ Error en seedRolesAndPermissionsClinic: ${err.message}`);
    }
};

module.exports = seedRolesAndPermissionsClinic;
