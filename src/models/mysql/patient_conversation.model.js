// src/models/mysql/patient_conversation.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientConversation = sequelize.define('PatientConversation', {
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

    // 🧑‍⚕️ Usuario autor o participante (doctor, recepcionista, etc.)
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario que registró o participó en la conversación'
    },



    // 💬 Título descriptivo
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Asunto o título de la conversación'
    },

    // 🗒️ Contenido o registro
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido de la conversación, resumen o mensaje completo'
    }

}, {
    tableName: 'patient_conversations',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_conversations_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_conversations_patient' },
        { fields: ['user_id'], name: 'idx_patient_conversations_user' }
    ]
});

module.exports = PatientConversation;
