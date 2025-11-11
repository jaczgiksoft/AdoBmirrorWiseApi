'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('occupations', {
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

      // 💼 Ocupación o profesión
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
        comment: 'Nombre de la ocupación o profesión del paciente'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción adicional o categoría de la ocupación'
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
    await queryInterface.addIndex('occupations', ['tenant_id'], {
      name: 'occupations_tenant_idx'
    });
    await queryInterface.addIndex('occupations', ['name'], {
      name: 'occupations_name_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('occupations');
  }
};
