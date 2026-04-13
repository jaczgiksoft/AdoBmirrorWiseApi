const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ExtractionOrderFile = sequelize.define('ExtractionOrderFile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    extraction_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_extraction_orders', key: 'id' }
    },

    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },

    path: {
        type: DataTypes.STRING,
        allowNull: false
    },

    mimetype: {
        type: DataTypes.STRING,
        allowNull: true
    },

    size: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

}, {
    tableName: 'extraction_order_files',
    timestamps: true,
    underscored: true
});

module.exports = ExtractionOrderFile;
