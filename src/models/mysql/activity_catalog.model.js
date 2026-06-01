const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ActivityCatalog = sequelize.define(
    'ActivityCatalog',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        tenant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        is_custom: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        tableName: 'activity_catalogs',
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = ActivityCatalog;
