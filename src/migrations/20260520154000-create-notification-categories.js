'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      icon: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      color: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex(
      'notification_categories',
      ['tenant_id'],
      {
        name: 'idx_notification_categories_tenant'
      }
    );

    await queryInterface.addIndex(
      'notification_categories',
      ['is_active'],
      {
        name: 'idx_notification_categories_active'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notification_categories');
  }
};
