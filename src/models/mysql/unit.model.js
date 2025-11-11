// src/models/mysql/unit.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Unit = sequelize.define('Unit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false },   // "Kilogramo"
    symbol: { type: DataTypes.STRING(10), allowNull: false }, // "kg"
    description: { type: DataTypes.STRING(255), allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'units',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Unit;
