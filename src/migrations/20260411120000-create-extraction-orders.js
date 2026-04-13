'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create patient_extraction_orders
    await queryInterface.createTable('patient_extraction_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      clinical_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed'),
        defaultValue: 'pending',
        allowNull: false
      },
      order_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // 2. Create extraction_order_teeth
    await queryInterface.createTable('extraction_order_teeth', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      extraction_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'patient_extraction_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tooth_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      extraction: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      areas: {
        type: Sequelize.JSON,
        allowNull: true
      }
    });

    // 3. Create extraction_order_files
    await queryInterface.createTable('extraction_order_files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      extraction_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'patient_extraction_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mimetype: {
        type: Sequelize.STRING,
        allowNull: true
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Indexes
    await queryInterface.addIndex('patient_extraction_orders', ['tenant_id']);
    await queryInterface.addIndex('patient_extraction_orders', ['patient_id']);
    await queryInterface.addIndex('extraction_order_teeth', ['extraction_order_id']);
    await queryInterface.addIndex('extraction_order_files', ['extraction_order_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('extraction_order_files');
    await queryInterface.dropTable('extraction_order_teeth');
    await queryInterface.dropTable('patient_extraction_orders');
  }
};
