'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bracket_types', {
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

      // 🦷 Tipo de bracket ortodóntico
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del tipo de bracket (ej. Metálico, Cerámico, Autoligado, etc.)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción adicional o notas sobre el tipo de bracket'
      },
      material: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Material base del bracket (ej. acero, cerámica, zafiro)'
      },
      manufacturer: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Fabricante o marca del bracket si aplica'
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
    await queryInterface.addIndex('bracket_types', ['tenant_id'], {
      name: 'bracket_types_tenant_idx'
    });
    await queryInterface.addIndex('bracket_types', ['name'], {
      name: 'bracket_types_name_idx'
    });
    await queryInterface.addIndex('bracket_types', ['material'], {
      name: 'bracket_types_material_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bracket_types');
  }
};
