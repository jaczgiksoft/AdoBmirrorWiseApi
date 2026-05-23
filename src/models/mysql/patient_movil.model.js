const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientMovil = sequelize.define('PatientMovil', {
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

    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Push notification token from mobile device'
    }

}, {
    tableName: 'patient_movil',
    timestamps: true,
    paranoid: false,
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_movil_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_movil_patient' },
        { fields: ['token'], name: 'idx_patient_movil_token' }
    ]
});

module.exports = PatientMovil;
