// src/bootstrap/seeds.js
const seedTenants = require('../utils/seedTenants');
const seedTenantModulesClinic = require('../utils/seedTenantModules');
const seedRolesAndPermissionsClinic = require('../utils/seedRolesAndPermissions');
const seedAdminUsersClinic = require('../utils/seedAdminUser');
const seedStores = require('../utils/seedStores'); // 🔹 nuevo
const seedCategories = require('../utils/seedCategories'); // 🔹 nuevo
const seedUnits = require('../utils/seedUnits'); // 🔹 nuevo
const seedTaxes = require('../utils/seedTaxes'); // 🔹 nuevo
const seedDepartments = require('../utils/seedDepartments'); // 🔹 nuevo
const seedPatientRelationsClinic = require('../utils/seedPatientRelationsClinic'); // 🔹 nuevo
const seedPatientsClinic = require('../utils/seedPatientsClinic'); // 🔹 nuevo

const { logger } = require('../utils/logger');

async function runSeeds() {
    try {
        logger.info('🌱 Iniciando seeders...');

        await seedTenants();                    // 1️⃣ Crea tenants con suscripción activa
        await seedStores();                     // 2️⃣ Crea sucursales para cada tenant
        await seedTenantModulesClinic();        // 3️⃣ Asigna módulos habilitados a cada tenant
        await seedRolesAndPermissionsClinic();  // 4️⃣ Crea roles base + permisos por módulo
        await seedPatientRelationsClinic();  // 4️⃣ Crea roles base + permisos por módulo
        await seedPatientsClinic();  // 4️⃣ Crea roles base + permisos por módulo
        await seedAdminUsersClinic();           // 5️⃣ Crea admin master por tenant

        // 🔹 Seeders globales
        await seedCategories();          // 6️⃣ Categorías globales
        await seedUnits();               // 7️⃣ Unidades globales
        await seedTaxes();               // 8️⃣ Impuestos globales
        await seedDepartments();         // 9️⃣ Departamentos base

        logger.info('✅ Seeders ejecutados correctamente');
    } catch (error) {
        logger.error('❌ Error al ejecutar seeders', { message: error.message, stack: error.stack });
    }
}

// 👇 Permite ejecutar directo con "node src/bootstrap/seeds.js"
if (require.main === module) {
    runSeeds();
}

module.exports = runSeeds;
