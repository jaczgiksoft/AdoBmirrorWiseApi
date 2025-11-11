// models/referral.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // 👤 Información del referidor
    name: { type: DataTypes.STRING(120), allowNull: false, comment: 'Nombre o fuente de referencia del paciente' },
    contact_name: { type: DataTypes.STRING(120), allowNull: true, comment: 'Persona de contacto si aplica' },
    contact_phone: { type: DataTypes.STRING(20), allowNull: true },
    contact_email: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },
    notes: { type: DataTypes.TEXT, allowNull: true }

}, {
    tableName: 'referrals',
    timestamps: true,
    paranoid: true,
    underscored: false
});

module.exports = Referral;
