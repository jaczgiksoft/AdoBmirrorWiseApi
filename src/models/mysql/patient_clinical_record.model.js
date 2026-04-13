// src/models/mysql/patient_clinical_record.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientClinicalRecord = sequelize.define('PatientClinicalRecord', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 👤 Patient Link
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🧬 Clinical Data (Flexibility)
    clinical_data: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }

}, {
    tableName: 'patient_clinical_records',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = PatientClinicalRecord;
