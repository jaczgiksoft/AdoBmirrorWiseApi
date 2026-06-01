const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AppointmentActivity = sequelize.define(
    'AppointmentActivity',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        activity_catalog_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        activity_name: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        tenant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'appointment_activities',
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = AppointmentActivity;
