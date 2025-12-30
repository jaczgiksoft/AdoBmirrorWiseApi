'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('extraction_teeth', {
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

      // 🦷 Identificador del diente (FDI)
      tooth_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Número de diente FDI (ej. 18, 36)'
      },

      // ⚠️ Estado
      extraction: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True indica que se ordenó extracción completa'
      },

      // 📐 Áreas tratadas (JSON)
      areas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array de áreas afectadas (ej. ["distal", "mesial"])'
      },

      // 🕒 No timestamps needed as per model definition
    });

    // =====================
    // 📊 Índices optimizados
    // =====================

    // Índice por orden de extracción
    await queryInterface.addIndex('extraction_teeth', ['patient_extraction_id'], {
      name: 'idx_extraction_teeth_order'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('extraction_teeth');
  }
};
