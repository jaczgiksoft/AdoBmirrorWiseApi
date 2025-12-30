const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AppointmentService = sequelize.define(
    'AppointmentService',
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
        service_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Snapshot fields
        service_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
    },
    {
        tableName: 'appointment_services',
        timestamps: true,
        underscored: true,
    }
);

module.exports = AppointmentService;
