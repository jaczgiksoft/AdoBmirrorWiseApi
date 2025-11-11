'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      // 🏢 Multi-tenant
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      // 🧩 Tipo de paciente
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del tipo de paciente (ej. Nuevo, Control, Referido)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción o propósito del tipo de paciente'
      },
      color: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
      },

      // 🕒 Sequelize timestamps (camelCase)
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índices recomendados
    await queryInterface.addIndex('patient_types', ['tenant_id'], {
      name: 'patient_types_tenant_idx'
    });
    await queryInterface.addIndex('patient_types', ['name'], {
      name: 'patient_types_name_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_types');
  }
};
