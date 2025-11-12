const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientPatientType = sequelize.define('PatientPatientType', {
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

    patient_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_types', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }

}, {
    tableName: 'patient_patient_types',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_patient_types_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_patient_types_patient' },
        { fields: ['patient_type_id'], name: 'idx_patient_patient_types_type' },
        {
            unique: true,
            fields: ['patient_id', 'patient_type_id'],
            name: 'uq_patient_patient_types_pair'
        }
    ]
});

module.exports = PatientPatientType;
