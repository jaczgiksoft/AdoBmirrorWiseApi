const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientExtraction = sequelize.define('PatientExtraction', {
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

    // 📄 Datos de la orden
    destination: {
        type: DataTypes.STRING(150),
        allowNull: true,
        comment: 'Destinatario o clínica de derivación'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Fecha de la orden o fecha sugerida'
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones clínicas'
    },

    // ✅ Procedimientos adicionales
    prophylaxis: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    fluoride: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    tableName: 'patient_extractions',
    timestamps: true,
    paranoid: true, // Soft delete supported
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_extractions_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_extractions_patient' },
        { fields: ['date'], name: 'idx_patient_extractions_date' }
    ]
});

module.exports = PatientExtraction;
