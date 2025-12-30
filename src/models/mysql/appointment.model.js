const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Appointment = sequelize.define(
    'Appointment',
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
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clinic_area_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        unit_value: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        units: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pendiente', 'confirmada', 'en_espera', 'en_tratamiento', 'finalizada', 'cancelada'),
            allowNull: false,
            defaultValue: 'pendiente',
        },
        treatment_started_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        treatment_finished_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        activities: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        effective_minutes: {
            type: DataTypes.VIRTUAL,
            get() {
                return (this.getDataValue('unit_value') || 0) * (this.getDataValue('units') || 0);
            },
        },
    },
    {
        tableName: 'appointments',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = Appointment;
