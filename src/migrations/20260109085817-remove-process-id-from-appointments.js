'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('appointments', 'process_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointments', 'process_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
