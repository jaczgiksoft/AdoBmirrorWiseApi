'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add checkin_at after status (conceptually before treatment_started_at)
    await queryInterface.addColumn('appointments', 'checkin_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'status'
    });

    // Add paid_at after treatment_finished_at
    await queryInterface.addColumn('appointments', 'paid_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'treatment_finished_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('appointments', 'checkin_at');
    await queryInterface.removeColumn('appointments', 'paid_at');
  }
};
