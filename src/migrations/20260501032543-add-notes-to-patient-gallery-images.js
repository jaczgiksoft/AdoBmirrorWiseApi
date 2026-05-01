
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('patient_gallery_images', 'notes', {
      type: Sequelize.JSON, // Adjust as needed manually
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('patient_gallery_images', 'notes');
  }
};
