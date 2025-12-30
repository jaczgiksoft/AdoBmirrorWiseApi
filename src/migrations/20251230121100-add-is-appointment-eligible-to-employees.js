'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('employees', 'is_appointment_eligible', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Indicates whether the employee can be assigned to appointments (citas)'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('employees', 'is_appointment_eligible');
    }
};
