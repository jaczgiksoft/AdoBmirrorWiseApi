'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_chat_participants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      chat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employee_chats',
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

      role: {
        type: Sequelize.ENUM('admin', 'member'),
        allowNull: false,
        defaultValue: 'member'
      },

      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      left_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Evita participantes duplicados en el mismo chat
    await queryInterface.addConstraint('employee_chat_participants', {
      fields: ['chat_id', 'user_id'],
      type: 'unique',
      name: 'unique_chat_user'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employee_chat_participants');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employee_chat_participants_role";'
    ).catch(() => { });
  }
};