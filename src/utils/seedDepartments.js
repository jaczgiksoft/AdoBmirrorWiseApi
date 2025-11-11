// src/utils/seedDepartments.js
const Department = require('../models/mysql/department.model');

const seedDepartments = async () => {
    const departments = [
        { tenant_id: 1, name: 'Abarrotes', description: 'Productos de consumo diario', status: 'active' },
        { tenant_id: 1, name: 'Lácteos', description: 'Leche, quesos, yogurt y derivados', status: 'active' },
        { tenant_id: 1, name: 'Bebidas', description: 'Refrescos, jugos, agua y bebidas alcohólicas', status: 'active' },
        { tenant_id: 1, name: 'Limpieza', description: 'Artículos de limpieza y hogar', status: 'active' },
        { tenant_id: 1, name: 'Higiene personal', description: 'Cuidado personal, cosméticos y aseo', status: 'active' },
        { tenant_id: 1, name: 'Panadería', description: 'Pan, pasteles y repostería', status: 'active' }
    ];

    for (const d of departments) {
        const exists = await Department.findOne({
            where: { name: d.name, tenant_id: d.tenant_id }
        });
        if (!exists) {
            await Department.create(d);
            console.log(`✅ Departamento creado: ${d.name}`);
        } else {
            console.log(`ℹ️ Departamento ya existe: ${d.name}`);
        }
    }
};

module.exports = seedDepartments;
