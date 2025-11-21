// src/models/mysql/patient_billing_data.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Patient = require('./patient.model');
const BillingData = require('./billing_data.model');

const PatientBillingData = sequelize.define('PatientBillingData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    billing_data_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'billing_data', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false }

}, {
    tableName: 'patient_billing_data',
    timestamps: true,
    paranoid: true,
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_billing_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_billing_patient' },
        { fields: ['billing_data_id'], name: 'idx_patient_billing_data' }
    ]
});

module.exports = PatientBillingData;
