const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Budget = sequelize.define(
    'Budget',
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
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        treatment_plan_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        duration_months: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        down_payment_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: true,
        },
        down_payment_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        down_payment_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: true,
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        monthly_payment: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
    },
    {
        tableName: 'budgets',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = Budget;
