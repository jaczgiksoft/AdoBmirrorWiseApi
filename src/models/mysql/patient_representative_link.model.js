// src/models/mysql/patient_representative_link.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Patient = require('./patient.model');
const PatientRepresentative = require('./patient_representative.model');

const PatientRepresentativeLink = sequelize.define('PatientRepresentativeLink', {
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

    representative_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_representatives', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false }

}, {
    tableName: 'patient_representative_links',
    timestamps: true,
    paranoid: true,
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_rep_links_tenant' },
        { fields: ['patient_id'], name: 'idx_rep_links_patient' },
        { fields: ['representative_id'], name: 'idx_rep_links_representative' },
        {
            unique: true,
            fields: ['tenant_id', 'patient_id', 'representative_id'],
            name: 'uq_rep_unique_relation'
        }
    ]
});

module.exports = PatientRepresentativeLink;
