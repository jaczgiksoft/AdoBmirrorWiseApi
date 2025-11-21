// src/models/mysql/billing_data.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BillingData = sequelize.define('BillingData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 📄 Datos fiscales
    business_name: { type: DataTypes.STRING(150), allowNull: false },
    rfc: { type: DataTypes.STRING(20), allowNull: false },
    tax_regime: { type: DataTypes.STRING(50), allowNull: false }, // c_RegimenFiscal SAT
    zip_code: { type: DataTypes.STRING(10), allowNull: false },
    email: {
        type: DataTypes.STRING(120),
        allowNull: true,
        validate: { isEmail: true }
    },

    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }

}, {
    tableName: 'billing_data',
    timestamps: true,
    paranoid: true,
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_billing_tenant' },
        { fields: ['rfc'], name: 'idx_billing_rfc' }
    ]
});

module.exports = BillingData;
