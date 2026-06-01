'use strict';

const DEFAULT_ACTIVITIES = [
    { name: 'Ajuste de brackets', is_custom: false, is_active: true },
    { name: 'Cambio de ligas', is_custom: false, is_active: true },
    { name: 'Cambio de arco', is_custom: false, is_active: true },
    { name: 'Revisión de brackets', is_custom: false, is_active: true },
    { name: 'Colocación de elásticos', is_custom: false, is_active: true },
    { name: 'Retiro de elásticos', is_custom: false, is_active: true },
    { name: 'Limpieza rápida', is_custom: false, is_active: true },
    { name: 'Revisión de higiene', is_custom: false, is_active: true },
    { name: 'Recementado de bracket', is_custom: false, is_active: true },
    { name: 'Indicaciones al paciente', is_custom: false, is_active: true },
    { name: 'Colocación de separadores', is_custom: false, is_active: true },
    { name: 'Retiro de separadores', is_custom: false, is_active: true },
    { name: 'Cementado de bandas', is_custom: false, is_active: true },
    { name: 'Colocación de bite turbos', is_custom: false, is_active: true },
    { name: 'Colocación de botones/TAD', is_custom: false, is_active: true },
    { name: 'Retiro de arco', is_custom: false, is_active: true },
    { name: 'Instrucción de elásticos', is_custom: false, is_active: true },
    { name: 'Colocación de cadena', is_custom: false, is_active: true },
    { name: 'Colocación de resorte', is_custom: false, is_active: true },
    { name: 'Cambio de powerchain', is_custom: false, is_active: true },
    { name: 'Activación distalizador', is_custom: false, is_active: true },
    { name: 'Ajuste de expansor', is_custom: false, is_active: true },
    { name: 'Revisión de headgear', is_custom: false, is_active: true },
    { name: 'Revisión de retenedor', is_custom: false, is_active: true },
    { name: 'Entrega de retenedor', is_custom: false, is_active: true },
    { name: 'Toma de fotografías', is_custom: false, is_active: true },
    { name: 'Indicación de CBCT', is_custom: false, is_active: true },
];

module.exports = {
    async up(queryInterface, Sequelize) {
        // Fetch existing default names for tenant 1 to avoid re-inserting them
        const existing = await queryInterface.sequelize.query(
            `SELECT name FROM activity_catalogs WHERE tenant_id = 1 AND is_custom = FALSE`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        const existingNames = new Set(existing.map(r => r.name));

        const now = new Date();
        const rows = DEFAULT_ACTIVITIES
            .filter(a => !existingNames.has(a.name))
            .map(a => ({
                tenant_id: 1,
                name: a.name,
                is_custom: a.is_custom,
                is_active: a.is_active,
                created_at: now,
                updated_at: now,
                deleted_at: null,
            }));

        if (rows.length > 0) {
            await queryInterface.bulkInsert('activity_catalogs', rows, {});
        }
    },

    async down(queryInterface, Sequelize) {
        const names = DEFAULT_ACTIVITIES.map(a => a.name);
        await queryInterface.bulkDelete('activity_catalogs', {
            tenant_id: 1,
            is_custom: false,
            name: { [Sequelize.Op.in]: names },
        }, {});
    },
};
