// src/utils/seedCategories.js
const Category = require('../models/mysql/category.model');

const seedCategories = async () => {
    const categories = [
        { name: 'General', description: 'Productos generales', include_in_closing: true, include_in_invoice: true, is_tax_deductible: true, is_system: true },
        { name: 'Servicios', description: 'Servicios no inventariables', include_in_closing: true, include_in_invoice: true, is_tax_deductible: true, is_system: false },
        { name: 'Promociones', description: 'Promociones y descuentos', include_in_closing: false, include_in_invoice: false, is_tax_deductible: false, is_system: true },
        { name: 'Gastos Internos', description: 'Movimientos internos no contabilizables', include_in_closing: false, include_in_invoice: false, is_tax_deductible: false, is_system: true }
    ];

    for (const c of categories) {
        let category = await Category.findOne({ where: { name: c.name } });
        if (!category) {
            await Category.create(c);
            console.log(`✅ Categoría creada: ${c.name}`);
        } else {
            console.log(`ℹ️ Categoría ya existe: ${c.name}`);
        }
    }
};

module.exports = seedCategories;
