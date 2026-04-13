const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientExtractionOrder = sequelize.define('PatientExtractionOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' }
    },

    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' }
    },

    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'employees', key: 'id' }
    },

    clinical_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM('pending', 'completed'),
        defaultValue: 'pending',
        allowNull: false
    },

    order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }

}, {
    tableName: 'patient_extraction_orders',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = PatientExtractionOrder;
