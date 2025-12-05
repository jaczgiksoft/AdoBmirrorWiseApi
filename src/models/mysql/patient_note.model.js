// src/models/mysql/patient_note.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientNote = sequelize.define('PatientNote', {
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

    // ✍️ Usuario autor de la nota
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario que creó la nota'
    },



    // 📝 Título y contenido
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Título de la nota clínica o administrativa'
    },

    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido o descripción detallada de la nota'
    },

    // 🔒 Privacidad de la nota
    is_private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True = visible solo para el autor o ciertos roles'
    }

}, {
    tableName: 'patient_notes',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_notes_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_notes_patient' },
        { fields: ['user_id'], name: 'idx_patient_notes_user' },
        { fields: ['is_private'], name: 'idx_patient_notes_privacy' }
    ]
});

module.exports = PatientNote;
