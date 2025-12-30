'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('extraction_files', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      // 🔗 Relación con la orden
      patient_extraction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patient_extractions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      // 📂 Metadatos del archivo
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },

      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      size: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      }
      // No paranoid (deleted_at) as per model definition
    });

    // =====================
    // 📊 Índices optimizados
    // =====================

    // Índice por orden de extracción
    await queryInterface.addIndex('extraction_files', ['patient_extraction_id'], {
      name: 'idx_extraction_files_order'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('extraction_files');
  }
};
