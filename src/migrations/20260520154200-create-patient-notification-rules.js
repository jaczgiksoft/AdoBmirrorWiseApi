'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_notification_rules', {
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

      custom_title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      custom_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },

      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      repeat_type: {
        type: Sequelize.ENUM('once', 'daily', 'weekly', 'monthly', 'custom'),
        allowNull: false,
        defaultValue: 'once'
      },

      repeat_days: {
        type: Sequelize.JSON,
        allowNull: true
      },

      next_run_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      context_data: {
        type: Sequelize.JSON,
        allowNull: true
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      'patient_notification_rules',
      ['tenant_id'],
      {
        name: 'idx_patient_notification_rules_tenant'
      }
    );

    await queryInterface.addIndex(
      'patient_notification_rules',
      ['patient_id'],
      {
        name: 'idx_patient_notification_rules_patient'
      }
    );

    await queryInterface.addIndex(
      'patient_notification_rules',
      ['template_id'],
      {
        name: 'idx_patient_notification_rules_template'
      }
    );

    await queryInterface.addIndex(
      'patient_notification_rules',
      ['is_active'],
      {
        name: 'idx_patient_notification_rules_active'
      }
    );

    await queryInterface.addIndex(
      'patient_notification_rules',
      ['next_run_at'],
      {
        name: 'idx_patient_notification_rules_next_run'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_notification_rules');

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_patient_notification_rules_repeat_type";'
      );
    }
  }
};
