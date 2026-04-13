// src/models/mysql/odontogram_detalle.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const OdontogramDetalle = sequelize.define('OdontogramDetalle', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    odontogram_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'odontograms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🦷 Identificador del diente (FDI)
    tooth_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // 📋 Estado del diente (toothState, brackets, periodontalData, toothNotes)
    status: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // 🎨 Estado de las caras (superior, inferior, izquierda, derecha, centro)
    caras: {
        type: DataTypes.JSON,
        allowNull: true
    }

}, {
    tableName: 'odontogram_details',
    timestamps: true,
    underscored: true
});

module.exports = OdontogramDetalle;
