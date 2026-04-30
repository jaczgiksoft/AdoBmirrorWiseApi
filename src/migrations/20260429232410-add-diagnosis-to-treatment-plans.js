'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('treatment_plans', 'diagnosis_content', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });

    await queryInterface.addColumn('treatment_plans', 'diagnosis_content_html', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('treatment_plans', 'diagnosis_content');
    await queryInterface.removeColumn('treatment_plans', 'diagnosis_content_html');
  }
};