const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BudgetItem = sequelize.define(
    'BudgetItem',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        budget_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        service_snapshot_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: 'budget_items',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = BudgetItem;
