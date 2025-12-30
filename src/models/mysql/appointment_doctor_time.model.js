const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AppointmentDoctorTime = sequelize.define(
    'AppointmentDoctorTime',
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
        started_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        finished_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: 'appointment_doctor_times',
        timestamps: true,
        underscored: true,
    }
);

module.exports = AppointmentDoctorTime;
