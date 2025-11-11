// src/utils/seedUnits.js
const Unit = require('../models/mysql/unit.model');

const seedUnits = async () => {
    const units = [
        { name: 'Pieza', symbol: 'pz', description: 'Unidad individual' },
        { name: 'Granel', symbol: 'gr', description: 'Venta a granel' },
        { name: 'Kit', symbol: 'kit', description: 'Conjunto de piezas' }
    ];

    for (const u of units) {
        let unit = await Unit.findOne({ where: { name: u.name } });
        if (!unit) {
            await Unit.create(u);
            console.log(`✅ Unidad creada: ${u.name}`);
        } else {
            console.log(`ℹ️ Unidad ya existe: ${u.name}`);
        }
    }
};

module.exports = seedUnits;
