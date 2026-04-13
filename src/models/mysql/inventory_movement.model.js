const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const InventoryMovement = sequelize.define(
    'InventoryMovement',
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
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(50), // "Entrada", "Salida", "Ajuste", etc.
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        provider_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'inventory_movements',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = InventoryMovement;
