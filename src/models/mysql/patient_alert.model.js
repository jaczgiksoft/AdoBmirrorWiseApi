const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientAlert = sequelize.define('PatientAlert', {
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

    // 📢 Información de la alerta
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Título o motivo de la alerta (ej. Alergia a penicilina)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // ⚙️ Nueva propiedad
    is_admin_alert: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True = alerta administrativa, False = alerta clínica'
    }

}, {
    tableName: 'patient_alerts',
    timestamps: true,
    paranoid: false,
    underscored: true,

    // 📊 Índices documentados
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_alerts_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_alerts_patient' },
        { fields: ['is_admin_alert'], name: 'idx_patient_alerts_admin' },
        {
            unique: true,
            fields: ['tenant_id', 'patient_id', 'title'],
            name: 'uq_patient_alerts_unique_title_per_patient'
        }
    ]
});

module.exports = PatientAlert;
