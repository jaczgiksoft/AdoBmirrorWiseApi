'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referrals', {
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

      // 👤 Información del referidor
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
        comment: 'Nombre o fuente de referencia del paciente'
      },
      contact_name: {
        type: Sequelize.STRING(120),
        allowNull: true,
        comment: 'Persona de contacto si aplica'
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('referrals', ['tenant_id'], {
      name: 'referrals_tenant_idx'
    });
    await queryInterface.addIndex('referrals', ['name'], {
      name: 'referrals_name_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('referrals');
  }
};
