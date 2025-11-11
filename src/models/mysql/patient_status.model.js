// models/patient_status.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientStatus = sequelize.define('PatientStatus', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // 🦷 Fase clínica del paciente
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre de la fase clínica (ej. Diagnóstico, Fase I, Retenedor, etc.)'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Descripción breve de la fase o condición del paciente'
    },
    color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Orden de visualización en la lista de fases'
    }

}, {
    tableName: 'patient_statuses',
    timestamps: true,
    paranoid: true,
    underscored: false
});

module.exports = PatientStatus;
