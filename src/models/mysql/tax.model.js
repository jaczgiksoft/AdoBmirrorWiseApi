// src/models/mysql/tax.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Tax = sequelize.define('Tax', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false }, // "IVA 16%"
    rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false }, // ej. 16.00
    description: { type: DataTypes.STRING(255), allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'taxes',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Tax;
