const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TenantFeature = sequelize.define('TenantFeature', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    feature: { type: DataTypes.STRING, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'tenant_features',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = TenantFeature;
