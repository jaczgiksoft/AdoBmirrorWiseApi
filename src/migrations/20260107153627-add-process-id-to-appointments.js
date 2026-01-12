'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('appointments', 'process_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'processes',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            after: 'clinic_area_id' // Placing it near other FKs logically
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('appointments', 'process_id');
    }
};
