const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TreatmentPlan = sequelize.define('TreatmentPlan', {
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

    title: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    duration_months: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'planned'
    }
}, {
    tableName: 'treatment_plans',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_treatment_plans_tenant' },
        { fields: ['patient_id'], name: 'idx_treatment_plans_patient' }
    ]
});

module.exports = TreatmentPlan;
