'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inventory_items', 'lot_number', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'purchase_price'
    });
    await queryInterface.addColumn('inventory_items', 'expiry_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'lot_number'
    });
    await queryInterface.addColumn('inventory_items', 'sale_price', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
      after: 'purchase_price'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inventory_items', 'lot_number');
    await queryInterface.removeColumn('inventory_items', 'expiry_date');
    await queryInterface.removeColumn('inventory_items', 'sale_price');
  }
};
