// src/models/mysql/patient_hobby.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientHobby = sequelize.define('PatientHobby', {
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

    // 🎯 Nombre del pasatiempo
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Ej: Fútbol, Pintar, Tocar guitarra'
    }
}, {
    tableName: 'patient_hobbies',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_hobbies_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_hobbies_patient' },
        {
            unique: true,
            fields: ['tenant_id', 'patient_id', 'name'],
            name: 'uq_patient_hobbies_unique_per_patient'
        }
    ]
});

module.exports = PatientHobby;
