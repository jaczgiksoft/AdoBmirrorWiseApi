'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'inventory_providers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      min_stock: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      current_stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      purchase_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory_items');
  },
};
