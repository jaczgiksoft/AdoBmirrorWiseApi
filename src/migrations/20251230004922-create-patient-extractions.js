'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient_extractions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      // 🏢 Multi-tenant
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

      // 👤 Paciente asociado
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

      // 📄 Datos de la orden
      destination: {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: 'Destinatario o clínica de derivación'
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha de la orden o fecha sugerida'
      },

      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones clínicas'
      },

      // ✅ Procedimientos adicionales
      prophylaxis: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fluoride: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('patient_extractions', ['tenant_id'], {
      name: 'idx_patient_extractions_tenant'
    });

    // Índice por paciente
    await queryInterface.addIndex('patient_extractions', ['patient_id'], {
      name: 'idx_patient_extractions_patient'
    });

    // Índice por fecha
    await queryInterface.addIndex('patient_extractions', ['date'], {
      name: 'idx_patient_extractions_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patient_extractions');
  }
};
