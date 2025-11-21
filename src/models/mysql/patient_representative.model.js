// src/models/mysql/patient_representative.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientRepresentative = sequelize.define('PatientRepresentative', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 👤 Datos del representante
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    relationship: { type: DataTypes.STRING(50), allowNull: true }, // padre, madre, tutor
    phone: { type: DataTypes.STRING(20), allowNull: true },
    phone_alt: { type: DataTypes.STRING(20), allowNull: true },
    email: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },

    address: { type: DataTypes.STRING(255), allowNull: true },

    // 🔐 Acceso a portal (opcional)
    username: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    can_login: { type: DataTypes.BOOLEAN, defaultValue: false },
    first_login: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login_at: { type: DataTypes.DATE, allowNull: true },

    // 🔒 Control
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }

}, {
    tableName: 'patient_representatives',
    timestamps: true,
    paranoid: true,
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_representatives_tenant' },
        { fields: ['email'], name: 'idx_representatives_email' }
    ]
});

module.exports = PatientRepresentative;
