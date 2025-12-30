const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Service = sequelize.define(
    'Service',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        tenant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        suggested_units: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        unit_value: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        requires_inventory: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        deductible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(7),
            defaultValue: '#CCCCCC',
            allowNull: false,
        },
        sat_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        cfdi_usage: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
    },
    {
        tableName: 'services',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = Service;
