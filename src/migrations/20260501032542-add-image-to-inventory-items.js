
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('inventory_items', 'image', {
      type: Sequelize.STRING, // Adjust as needed manually
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('inventory_items', 'image');
  }
};
