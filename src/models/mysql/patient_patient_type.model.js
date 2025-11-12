// models/patient_patient_type.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientPatientType = sequelize.define('PatientPatientType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    patient_id: { type: DataTypes.INTEGER, allowNull: false },
    patient_type_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'patient_patient_types',
    timestamps: true,
    paranoid: true,
});

module.exports = PatientPatientType;
