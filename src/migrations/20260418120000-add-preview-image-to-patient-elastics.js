'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('patient_elastics', 'preview_image_url', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'odontogram_data'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('patient_elastics', 'preview_image_url');
  }
};
