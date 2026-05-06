'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('patient_elastics', 'uuid');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('patient_elastics', 'uuid', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  }
};