const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const InventoryItem = sequelize.define(
    'InventoryItem',
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
        provider_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        sku: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        min_stock: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        current_stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        purchase_price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
            allowNull: false,
        },
    },
    {
        tableName: 'inventory_items',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = InventoryItem;
