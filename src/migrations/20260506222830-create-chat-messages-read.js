'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_messages_read', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      read_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Evita duplicar lecturas del mismo usuario
    await queryInterface.addConstraint('chat_messages_read', {
      fields: ['message_id', 'user_id'],
      type: 'unique',
      name: 'unique_message_read_user'
    });

    // Índices recomendados
    await queryInterface.addIndex('chat_messages_read', ['message_id']);
    await queryInterface.addIndex('chat_messages_read', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chat_messages_read');
  }
};