const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ExtractionOrderTooth = sequelize.define('ExtractionOrderTooth', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    extraction_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_extraction_orders', key: 'id' }
    },

    tooth_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    extraction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },

    areas: {
        type: DataTypes.JSON,
        allowNull: true
    }

}, {
    tableName: 'extraction_order_teeth',
    timestamps: false,
    underscored: true
});

module.exports = ExtractionOrderTooth;
