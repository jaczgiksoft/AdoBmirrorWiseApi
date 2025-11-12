const Tenant = require('../models/mysql/tenant.model');
const TenantModule = require('../models/mysql/tenant_module.model');
const TenantFeature = require('../models/mysql/tenant_feature.model');
const Subscription = require('../models/mysql/subscription.model');
const { logger } = require('./logger');

// =========================
// Módulos base (core) — SIEMPRE ACTIVOS
// =========================
const coreModules = [
    'users',
    'roles',
    'permissions',
    'auth',
    'settings',
    'logs',
    'notifications'
];

// =========================
// Módulos clínicos por plan
// =========================
const planModules = {
    Basic: [
        'patients',
        'patient_alerts',
        'appointments',
        'billing'
    ],
    Pro: [
        'patients',
        'patient_alerts',
        'appointments',
        'billing',
        'communications',
        'inventory'
    ],
    Premium: [
        'patients',
        'patient_alerts',
        'appointments',
        'billing',
        'communications',
        'inventory',
        'reports',
        'integrations',
        'patientPortal'
    ]
};

// =========================
// Funcionalidades (features) — SIEMPRE ACTIVAS
// =========================
const coreFeatures = [
    'dataEncryption',
    'notifications',
    'activityLogs',
    'multiUserAccess',
    'securityAudit'
];

// =========================
// Seeder principal (Clínica)
// =========================
const seedTenantModulesClinic = async () => {
    try {
        const tenants = await Tenant.findAll({ where: { status: 'active' } });

        for (const tenant of tenants) {
            const subscription = await Subscription.findOne({
                where: { id: tenant.current_subscription_id }
            });

            const planName = subscription ? subscription.plan_name : 'Basic';
            const clinicModules = planModules[planName] || planModules.Basic;

            // 🔹 Combinar los módulos base + clínicos del plan
            const enabledModules = [...coreModules, ...clinicModules];

            // Crear módulos
            await TenantModule.bulkCreate(
                enabledModules.map(moduleName => ({
                    tenant_id: tenant.id,
                    module: moduleName,
                    is_enabled: true
                })),
                { ignoreDuplicates: true }
            );

            // Crear funcionalidades base (features)
            await TenantFeature.bulkCreate(
                coreFeatures.map(feature => ({
                    tenant_id: tenant.id,
                    feature,
                    is_enabled: true
                })),
                { ignoreDuplicates: true }
            );

            logger.info(
                `✅ Clínica ${tenant.name} (${planName}) inicializada con módulos: ${enabledModules.join(', ')}`
            );
        }
    } catch (err) {
        logger.error(`❌ Error en seedTenantModulesClinic: ${err.message}`);
    }
};

module.exports = seedTenantModulesClinic;
