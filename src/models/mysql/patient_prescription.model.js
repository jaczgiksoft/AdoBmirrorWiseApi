// src/models/mysql/patient_prescription.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientPrescription = sequelize.define('PatientPrescription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 👤 Paciente asociado
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🎯 Título de la prescripción
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Título de la prescripción'
    },

    // 📝 Contenido de la prescripción
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido detallado de la prescripción'
    }
}, {
    tableName: 'patient_prescriptions',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_prescriptions_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_prescriptions_patient' },
        {
            unique: true,
            fields: ['tenant_id', 'patient_id', 'title'],
            name: 'uq_patient_prescriptions_unique_per_patient'
        }
    ]
});

module.exports = PatientPrescription;
