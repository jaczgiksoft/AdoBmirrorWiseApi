const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CashMovement = sequelize.define('CashMovement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },
    cash_register_id: { type: DataTypes.INTEGER, allowNull: false },
    cash_session_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // ✅ permitir NULL
        comment: 'Usuario que abrió la sesión (nullable si el usuario fue eliminado)'
    },

    type: {
        type: DataTypes.ENUM('inflow', 'outflow'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0.01 }
    },
    concept: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'cash_movements',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = CashMovement;
