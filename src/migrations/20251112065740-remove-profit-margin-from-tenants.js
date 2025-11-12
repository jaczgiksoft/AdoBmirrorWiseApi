'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 🔹 Eliminar columna profit_margin de tenants
        await queryInterface.removeColumn('tenants', 'profit_margin');
    },

    async down(queryInterface, Sequelize) {
        // 🔹 En caso de rollback, volver a crearla
        await queryInterface.addColumn('tenants', 'profit_margin', {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 30.00,
            comment: 'Margen global de ganancia en porcentaje'
        });
    }
};
