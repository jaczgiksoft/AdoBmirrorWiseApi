'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clinic_areas', {
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

      status: {
        type: Sequelize.ENUM('active', 'maintenance', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
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
    await queryInterface.addIndex('clinic_areas', ['tenant_id'], {
      name: 'idx_clinic_areas_tenant'
    });

    // Único (tenant_id + name) para evitar duplicados dentro del mismo tenant
    await queryInterface.addConstraint('clinic_areas', {
      fields: ['tenant_id', 'name'],
      type: 'unique',
      name: 'uq_clinic_areas_tenant_name'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clinic_areas');
  }
};
