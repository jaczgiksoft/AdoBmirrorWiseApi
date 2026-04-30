'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('elastic_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        type: Sequelize.STRING(100),
        allowNull: false
      },

      color: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: '#CCCCCC'
      },

      type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      size: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      oz: {
        type: Sequelize.STRING(20),
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

    // Índices
    await queryInterface.addIndex('elastic_types', ['tenant_id'], {
      name: 'idx_elastic_types_tenant'
    });

    await queryInterface.addIndex('elastic_types', ['name'], {
      name: 'idx_elastic_types_name'
    });

    await queryInterface.addConstraint('elastic_types', {
      fields: ['tenant_id', 'name', 'size', 'oz'],
      type: 'unique',
      name: 'uq_elastic_types_tenant_config'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('elastic_types');
  }
};