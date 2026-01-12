const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AppointmentProcess = sequelize.define('AppointmentProcess', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    process_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional reference to template
    },
    name_snapshot: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'appointment_processes',
    underscored: true,
    timestamps: true,
});

module.exports = AppointmentProcess;
