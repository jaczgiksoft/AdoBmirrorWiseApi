// src/models/mysql/department.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Department = sequelize.define('Department', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },

    profit_margin: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Margen de ganancia por departamento (override del store o tenant)',
    },
    use_parent_profit_margin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si es true, usa el margen del nivel superior',
    },

    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'departments',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Department;
