'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_movements', {
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
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false, // "Entrada", "Salida", "Ajuste", etc.
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      reference: {
        type: Sequelize.STRING(150),
        allowNull: true,
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
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Optional user tracking
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    await queryInterface.dropTable('inventory_movements');
  },
};
