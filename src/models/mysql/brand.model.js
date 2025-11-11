// src/models/mysql/brand.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Brand = sequelize.define('Brand', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    logo_url: { type: DataTypes.STRING, allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'brands',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Brand;
