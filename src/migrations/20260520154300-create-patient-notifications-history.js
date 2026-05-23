'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_notifications_history', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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

      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'notification_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      final_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      final_message: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      sent_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      status: {
        type: Sequelize.ENUM('sent', 'failed', 'opened'),
        allowNull: false,
        defaultValue: 'sent'
      },

      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      metadata: {
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
      'patient_notifications_history',
      ['tenant_id'],
      {
        name: 'idx_patient_notifications_history_tenant'
      }
    );

    await queryInterface.addIndex(
      'patient_notifications_history',
      ['patient_id'],
      {
        name: 'idx_patient_notifications_history_patient'
      }
    );

    await queryInterface.addIndex(
      'patient_notifications_history',
      ['template_id'],
      {
        name: 'idx_patient_notifications_history_template'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_notifications_history');

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_patient_notifications_history_status";'
      );
    }
  }
};
