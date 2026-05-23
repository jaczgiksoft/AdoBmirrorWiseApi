'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'notification_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      code: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      title_template: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      message_template: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      language: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'es'
      },

      allowed_placeholders: {
        type: Sequelize.JSON,
        allowNull: true
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
      'notification_templates',
      ['category_id'],
      {
        name: 'idx_notification_templates_category'
      }
    );

    await queryInterface.addIndex(
      'notification_templates',
      ['code'],
      {
        name: 'idx_notification_templates_code'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notification_templates');
  }
};
