// src/utils/seedTaxes.js
const Tax = require('../models/mysql/tax.model');

const seedTaxes = async () => {
    const taxes = [
        { name: 'IVA 8%', rate: 0.08, description: 'IVA reducido 8%' },
        { name: 'IVA 16%', rate: 0.16, description: 'IVA general 16%' },
        { name: 'IEPS 8%', rate: 0.08, description: 'Impuesto Especial sobre Producción y Servicios 8%' }
    ];

    for (const t of taxes) {
        let tax = await Tax.findOne({ where: { name: t.name } });
        if (!tax) {
            await Tax.create(t);
            console.log(`✅ Impuesto creado: ${t.name}`);
        } else {
            console.log(`ℹ️ Impuesto ya existe: ${t.name}`);
        }
    }
};

module.exports = seedTaxes;
