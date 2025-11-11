'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_statuses', {
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

      // 🦷 Fase clínica del paciente
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la fase clínica (ej. Diagnóstico, Fase I, Retenedor, etc.)'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción breve de la fase o condición del paciente'
      },
      color: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden de visualización en la lista de fases clínicas'
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
    await queryInterface.addIndex('patient_statuses', ['tenant_id'], {
      name: 'patient_statuses_tenant_idx'
    });
    await queryInterface.addIndex('patient_statuses', ['name'], {
      name: 'patient_statuses_name_idx'
    });
    await queryInterface.addIndex('patient_statuses', ['order_index'], {
      name: 'patient_statuses_order_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_statuses');
  }
};
