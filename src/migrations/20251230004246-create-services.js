'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'total chair / patient time in minutes'
      },

      suggested_units: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'suggested doctor units (template only)'
      },

      unit_value: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'minutes per unit (template only)'
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      requires_inventory: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      deductible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      color: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#CCCCCC'
      },

      sat_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },

      cfdi_usage: {
        type: Sequelize.STRING(5),
        allowNull: true
      },

      // 🕒 Sequelize timestamps (snake_case)
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // =====================
    // 📊 Índices optimizados
    // =====================

    // Índice por tenant
    await queryInterface.addIndex('services', ['tenant_id'], {
      name: 'idx_services_tenant'
    });

    // Único (tenant_id + name) para evitar duplicados dentro del mismo tenant
    await queryInterface.addConstraint('services', {
      fields: ['tenant_id', 'name'],
      type: 'unique',
      name: 'uq_services_tenant_name'
    });

    // Índice opcional (requires_inventory)
    await queryInterface.addIndex('services', ['requires_inventory'], {
      name: 'idx_services_requires_inventory'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('services');
  }
};
