'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Assuming tenant_id 1 is the default dev tenant
        const TENANT_ID = 1;

        // Check if data exists
        const existing = await queryInterface.rawSelect('treatment_catalogs', {
            where: { tenant_id: TENANT_ID },
        }, ['id']);

        if (existing) return;

        await queryInterface.bulkInsert('treatment_catalogs', [
            {
                tenant_id: TENANT_ID,
                title: 'Brackets Metálicos',
                description: 'Ortodoncia convencional con brackets metálicos.',
                color: '#3b82f6', // blue
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Brackets Cerámicos',
                description: 'Ortodoncia estética con brackets de cerámica.',
                color: '#ffffff', // white/light
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Brackets Zafiro',
                description: 'Ortodoncia estética de alta transparencia.',
                color: '#a5f3fc', // cyan-200
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Invisalign',
                description: 'Alineadores transparentes removibles.',
                color: '#14b8a6', // teal
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Retenedor Hawley',
                description: 'Retenedor removible con alambre vestibular.',
                color: '#a855f7', // purple
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Retenedor Fijo',
                description: 'Barra lingual cementada.',
                color: '#64748b', // slate
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Expansor Hyrax',
                description: 'Disyuntor palatino para expansión rápida.',
                color: '#ef4444', // red
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tenant_id: TENANT_ID,
                title: 'Limpieza Dental',
                description: 'Profilaxis y eliminación de sarro.',
                color: '#22c55e', // green
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('treatment_catalogs', null, {});
    }
};
