const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AppointmentEvaluation = sequelize.define(
    'AppointmentEvaluation',
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
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        oral_hygiene: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        appliance_care: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        elastic_usage: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        treatment_progress: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: 'appointment_evaluations',
        timestamps: true,
        paranoid: false,
        underscored: true,
    }
);

module.exports = AppointmentEvaluation;
