// src/utils/seedRolesAndPermissions.js
const Role = require('../models/mysql/role.model');
const Permission = require('../models/mysql/permission.model');
const Tenant = require('../models/mysql/tenant.model');
const TenantModule = require('../models/mysql/tenant_module.model');
const { logger } = require('./logger');

const seedRolesAndPermissionsClinic = async () => {
    try {
        const tenants = await Tenant.findAll({ where: { status: 'active' } });
        if (!tenants.length) {
            logger.warn('⚠️ No hay tenants activos para asignar roles y permisos.');
            return;
        }

        // Roles base clínicos
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

        for (const tenant of tenants) {
            const modules = await TenantModule.findAll({
                where: { tenant_id: tenant.id, is_enabled: true }
            });

            const enabledModules = modules.map(m => m.module);
            logger.info(`🔹 Iniciando roles/permisos para clínica: ${tenant.name}`);

            // Crear roles base
            for (const roleName of rolesBase) {
                const [role, created] = await Role.findOrCreate({
                    where: { name: roleName, tenant_id: tenant.id },
                    defaults: {
                        name: roleName,
                        tenant_id: tenant.id,
                        requires_cash_session: false // campo del modelo actualizado
                    }
                });

                if (created)
                    logger.info(`✅ Rol creado: ${roleName} (${tenant.name})`);

                // Generar permisos base por módulo
                const permsToCreate = enabledModules.map(moduleName => {
                    let perms = { can_read: true, can_write: false, can_edit: false, can_delete: false };

                    if (['Administrador General', 'Director Médico'].includes(roleName)) {
                        perms = { can_read: true, can_write: true, can_edit: true, can_delete: true };
                    } else if (['Odontólogo', 'Especialista'].includes(roleName)) {
                        perms = { can_read: true, can_write: true, can_edit: true, can_delete: false };
                    } else if (['Recepcionista', 'Asistente Dental', 'Higienista'].includes(roleName)) {
                        perms = { can_read: true, can_write: true, can_edit: false, can_delete: false };
                    }

                    return {
                        tenant_id: tenant.id,
                        role_id: role.id,
                        module: moduleName,
                        ...perms
                    };
                });

                // Crear permisos que no existan
                for (const p of permsToCreate) {
                    const exists = await Permission.findOne({
                        where: {
                            tenant_id: tenant.id,
                            role_id: p.role_id,
                            module: p.module
                        }
                    });

                    if (!exists) await Permission.create(p);
                }
            }

            logger.info(`🎯 Roles y permisos configurados para clínica ${tenant.name}`);
        }

        logger.info('🌱 Roles y permisos inicializados correctamente para todas las clínicas.');
    } catch (err) {
        logger.error(`❌ Error en seedRolesAndPermissionsClinic: ${err.message}`, {
            stack: err.stack
        });
    }
};

module.exports = seedRolesAndPermissionsClinic;
