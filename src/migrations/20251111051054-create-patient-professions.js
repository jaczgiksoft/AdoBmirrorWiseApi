'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_professions', {
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

      // 🎓 Profesión o título del paciente
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre o título profesional (ej. Dr., Lic., Ing., C.D., Mtro.)'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción o detalle del título profesional'
      },
      abbreviation: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Abreviatura estándar (ej. Dr., Mtra., C.D.)'
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
    await queryInterface.addIndex('patient_professions', ['tenant_id'], {
      name: 'patient_professions_tenant_idx'
    });
    await queryInterface.addIndex('patient_professions', ['name'], {
      name: 'patient_professions_name_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_professions');
  }
};
