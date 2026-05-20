'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_notifications', {
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

      notification_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'notification_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false
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
        type: Sequelize.ENUM(
          'once',
          'daily',
          'weekly',
          'monthly',
          'custom'
        ),
        allowNull: false,
        defaultValue: 'daily'
      },

      repeat_days: {
        type: Sequelize.JSON,
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      next_run_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      metadata: {
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

    // Índices
    await queryInterface.addIndex(
      'patient_notifications',
      ['tenant_id'],
      {
        name: 'idx_patient_notifications_tenant'
      }
    );

    await queryInterface.addIndex(
      'patient_notifications',
      ['patient_id'],
      {
        name: 'idx_patient_notifications_patient'
      }
    );

    await queryInterface.addIndex(
      'patient_notifications',
      ['notification_type_id'],
      {
        name: 'idx_patient_notifications_type'
      }
    );

    await queryInterface.addIndex(
      'patient_notifications',
      ['is_active'],
      {
        name: 'idx_patient_notifications_active'
      }
    );

    // MUY IMPORTANTE para scheduler
    await queryInterface.addIndex(
      'patient_notifications',
      ['next_run_at'],
      {
        name: 'idx_patient_notifications_next_run'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_notifications');

    // Limpia ENUM en PostgreSQL
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_patient_notifications_repeat_type";'
      );
    }
  }
};