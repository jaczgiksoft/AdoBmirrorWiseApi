// src/models/mysql/cashRegister.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CashRegister = sequelize.define('CashRegister', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },

    code: { type: DataTypes.STRING(20), allowNull: false }, // ej. CAJ-001
    name: { type: DataTypes.STRING, allowNull: false },

    status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        defaultValue: 'active'
    },

    current_session_id: { type: DataTypes.INTEGER, allowNull: true },
    is_main: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'cash_registers',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = CashRegister;
