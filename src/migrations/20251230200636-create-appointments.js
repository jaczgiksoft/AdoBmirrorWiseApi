'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
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

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      clinic_area_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clinic_areas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },

      unit_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Minutes per unit'
      },

      units: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Number of units'
      },

      status: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'en_espera', 'en_tratamiento', 'finalizada', 'cancelada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },

      treatment_started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      treatment_finished_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      activities: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
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

    // Indexes
    await queryInterface.addIndex('appointments', ['tenant_id'], {
      name: 'idx_appointments_tenant'
    });
    await queryInterface.addIndex('appointments', ['patient_id'], {
      name: 'idx_appointments_patient'
    });
    await queryInterface.addIndex('appointments', ['employee_id'], {
      name: 'idx_appointments_employee'
    });
    await queryInterface.addIndex('appointments', ['clinic_area_id'], {
      name: 'idx_appointments_clinic_area'
    });
    await queryInterface.addIndex('appointments', ['tenant_id', 'date'], {
      name: 'idx_appointments_tenant_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');
  }
};
