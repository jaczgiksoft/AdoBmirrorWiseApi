const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ExtractionFile = sequelize.define('ExtractionFile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🔗 Relación con la orden
    patient_extraction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_extractions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 📂 Metadatos del archivo
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    original_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    path: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

}, {
    tableName: 'extraction_files',
    timestamps: true,
    paranoid: false,
    underscored: true,

    indexes: [
        { fields: ['patient_extraction_id'], name: 'idx_extraction_files_order' }
    ]
});

module.exports = ExtractionFile;
