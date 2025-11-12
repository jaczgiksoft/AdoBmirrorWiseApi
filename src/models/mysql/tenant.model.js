// src/models/mysql/tenant.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Tenant = sequelize.define('Tenant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏷️ Identidad principal
    code: { type: DataTypes.STRING(8), allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
    logo_url: { type: DataTypes.STRING },
    website: { type: DataTypes.STRING, allowNull: true },

    // 📞 Contacto
    contact_name: { type: DataTypes.STRING, allowNull: true },
    contact_email: { type: DataTypes.STRING, allowNull: true },
    contact_phone: { type: DataTypes.STRING, allowNull: true },

    // 🏠 Dirección
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    postal_code: { type: DataTypes.STRING, allowNull: true },

    // 🧾 Datos fiscales
    tax_id: { type: DataTypes.STRING, allowNull: true },
    legal_name: { type: DataTypes.STRING, allowNull: true },
    regime: { type: DataTypes.STRING, allowNull: true },
    certificate_path: { type: DataTypes.STRING, allowNull: true },
    key_path: { type: DataTypes.STRING, allowNull: true },
    certificate_password: { type: DataTypes.STRING, allowNull: true },
    cfdi_use: { type: DataTypes.STRING, allowNull: true },
    payment_method: { type: DataTypes.STRING, allowNull: true },
    payment_form: { type: DataTypes.STRING, allowNull: true },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 16.0 },

    // ⚕️ Registro sanitario
    health_registration: { type: DataTypes.STRING, allowNull: true },
    health_registration_expires_at: { type: DataTypes.DATE, allowNull: true },

    // ⚙️ Configuración y estado
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
    },
    current_subscription_id: { type: DataTypes.INTEGER, allowNull: true },
    max_users: { type: DataTypes.INTEGER, defaultValue: 5 },
    current_users: { type: DataTypes.INTEGER, defaultValue: 0 },

    // 🌐 Configuración regional y monetaria
    timezone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'America/Hermosillo',
    },
    currency: { type: DataTypes.STRING, defaultValue: 'MXN' },
    exchange_rate: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    profit_margin: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 30.0 },

    // 🕓 Horarios y clínica
    opening_hours: { type: DataTypes.JSON, allowNull: true },
    specialties: { type: DataTypes.JSON, allowNull: true },
    number_of_rooms: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: 'tenants',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // ⚙️ Índices eficientes
    indexes: [
        { unique: true, fields: ['code'], name: 'idx_tenants_code' },
        { unique: true, fields: ['name'], name: 'idx_tenants_name' },
        { fields: ['status'], name: 'idx_tenants_status' },
        { fields: ['city'], name: 'idx_tenants_city' },
        { fields: ['country'], name: 'idx_tenants_country' },
        { fields: ['current_subscription_id'], name: 'idx_tenants_subscription' },
    ],
});

module.exports = Tenant;
