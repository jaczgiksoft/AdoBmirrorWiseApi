const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ExtractionTooth = sequelize.define('ExtractionTooth', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🔗 Relación con la orden
    patient_extraction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_extractions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🦷 Identificador del diente (FDI)
    tooth_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Número de diente FDI (ej. 18, 36)'
    },

    // ⚠️ Estado
    extraction: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True indica que se ordenó extracción completa'
    },

    // 📐 Áreas tratadas (JSON)
    areas: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array de áreas afectadas (ej. ["distal", "mesial"])'
    }

}, {
    tableName: 'extraction_teeth',
    timestamps: false, // No necesitamos timestamps para estos detalles
    paranoid: false,
    underscored: true,

    indexes: [
        { fields: ['patient_extraction_id'], name: 'idx_extraction_teeth_order' }
    ]
});

module.exports = ExtractionTooth;
