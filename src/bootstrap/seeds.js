// src/bootstrap/seeds.js
const seedTenants = require('../utils/seedTenants');
const seedTenantModulesClinic = require('../utils/seedTenantModules');
const seedRolesAndPermissionsClinic = require('../utils/seedRolesAndPermissions');
const seedAdminUsersClinic = require('../utils/seedAdminUser');
const seedPatientRelationsClinic = require('../utils/seedPatientRelationsClinic');
const seedPatientsClinic = require('../utils/seedPatientsClinic');

const { logger } = require('../utils/logger');

async function runSeeds() {
    try {
        logger.info('🌱 Iniciando seeders clínicos...');

        // 1️⃣ Crea tenant base (clínica principal)
        await seedTenants();

        // 2️⃣ Asigna módulos habilitados a cada clínica (tenant)
        await seedTenantModulesClinic();

        // 3️⃣ Crea roles y permisos base (admin, doctor, asistente, etc.)
        await seedRolesAndPermissionsClinic();

        // 4️⃣ Crea relaciones clínicas base (referencias, ocupaciones, etc.)
        await seedPatientRelationsClinic();

        // 5️⃣ Crea pacientes demo (opcional, para desarrollo)
        // await seedPatientsClinic();

        // 6️⃣ Crea usuario administrador principal
        await seedAdminUsersClinic();

        logger.info('✅ Seeders clínicos ejecutados correctamente');
    } catch (error) {
        logger.error('❌ Error al ejecutar seeders', {
            message: error.message,
            stack: error.stack
        });
    }
}

// 👇 Permite ejecutar directo con "node src/bootstrap/seeds.js"
if (require.main === module) {
    runSeeds();
}

module.exports = runSeeds;
