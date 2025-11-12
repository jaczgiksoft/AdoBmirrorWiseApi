const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientType = sequelize.define('PatientType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🧩 Tipo de paciente
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre del tipo de paciente (ej. Nuevo, Control, Referido)'
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción o propósito del tipo de paciente'
    },

    color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
    }

}, {
    tableName: 'patient_types',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (informativos)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_types_tenant' },
        { fields: ['name'], name: 'idx_patient_types_name' },
        {
            unique: true,
            fields: ['tenant_id', 'name'],
            name: 'uq_patient_types_tenant_name'
        }
    ]
});

module.exports = PatientType;
