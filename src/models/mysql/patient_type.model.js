// models/patient_type.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientType = sequelize.define('PatientType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // 🧩 Tipo de paciente
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre del tipo de paciente (ej. Nuevo, Control, Referido)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción o propósito del tipo de paciente'
    },
    color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
    }

}, {
    tableName: 'patient_types',
    timestamps: true,
    paranoid: true,
    underscored: false
});

module.exports = PatientType;
