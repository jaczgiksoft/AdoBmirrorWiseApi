// src/models/mysql/category.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    include_in_closing: { type: DataTypes.BOOLEAN, defaultValue: true },
    include_in_invoice: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_tax_deductible: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'categories',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Category;
