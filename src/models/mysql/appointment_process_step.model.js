const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AppointmentProcessStep = sequelize.define('AppointmentProcessStep', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    appointment_process_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    step_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional reference to original step
    },
    name_snapshot: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'appointment_process_steps',
    underscored: true,
    timestamps: true,
});

module.exports = AppointmentProcessStep;
