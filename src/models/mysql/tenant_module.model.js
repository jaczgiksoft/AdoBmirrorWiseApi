// src/models/mysql/tenant_module.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TenantModule = sequelize.define('TenantModule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' }
    },
    module: { type: DataTypes.STRING, allowNull: false }, // ejemplo: 'users', 'hr', 'cctv'
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'tenant_modules',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = TenantModule;
