const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const InventoryProvider = sequelize.define(
    'InventoryProvider',
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
        contact_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        rfc: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
            allowNull: false,
        },
    },
    {
        tableName: 'inventory_providers',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = InventoryProvider;
