const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientElastic = sequelize.define('PatientElastic', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 👤 Paciente
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    upper_elastic: {
        type: DataTypes.STRING,
        allowNull: true
    },

    lower_elastic: {
        type: DataTypes.STRING,
        allowNull: true
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    hours: {
        type: DataTypes.STRING,
        allowNull: true
    },

    odontogram_data: {
        type: DataTypes.JSON,
        allowNull: true
    }

}, {
    tableName: 'patient_elastics',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_elastics_tenant_id' },
        { fields: ['patient_id'], name: 'idx_patient_elastics_patient_id' }
    ]
});

module.exports = PatientElastic;
