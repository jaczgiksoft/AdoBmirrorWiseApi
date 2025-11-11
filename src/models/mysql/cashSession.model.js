// src/models/mysql/cashSession.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CashSession = sequelize.define('CashSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },
    cash_register_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // ✅ permitir NULL
        comment: 'Usuario que abrió la sesión (nullable si el usuario fue eliminado)'
    },
    opened_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    closed_at: { type: DataTypes.DATE, allowNull: true },

    opening_balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    closing_balance: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    has_movements: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si se registraron movimientos en la sesión (ventas, ingresos, retiros, etc.)'
    },

    status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open'
    },

    notes: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'cash_sessions',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = CashSession;
