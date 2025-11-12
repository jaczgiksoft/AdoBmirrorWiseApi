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
    tax_id: { type: DataTypes.STRING, allowNull: true },       // RFC / NIT / CUIT
    legal_name: { type: DataTypes.STRING, allowNull: true },   // Razón social
    regime: { type: DataTypes.STRING, allowNull: true },       // Régimen fiscal
    certificate_path: { type: DataTypes.STRING, allowNull: true },
    key_path: { type: DataTypes.STRING, allowNull: true },
    certificate_password: { type: DataTypes.STRING, allowNull: true },
    cfdi_use: { type: DataTypes.STRING, allowNull: true },
    payment_method: { type: DataTypes.STRING, allowNull: true },
    payment_form: { type: DataTypes.STRING, allowNull: true },
    tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 16.00,
        comment: 'IVA o impuesto local aplicado a servicios'
    },

    // ⚕️ Registro sanitario (COFEPRIS)
    health_registration: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Número de registro o permiso sanitario COFEPRIS'
    },
    health_registration_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de vencimiento del registro sanitario (si aplica)'
    },

    // ⚙️ Configuración y estado
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    },
    current_subscription_id: { type: DataTypes.INTEGER, allowNull: true },
    max_users: { type: DataTypes.INTEGER, defaultValue: 5 },
    current_users: { type: DataTypes.INTEGER, defaultValue: 0 },

    // 🌐 Configuración regional y monetaria
    timezone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'America/Hermosillo',
        comment: 'Zona horaria de la clínica'
    },
    currency: { type: DataTypes.STRING, defaultValue: 'MXN' },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Tipo de cambio del dólar respecto a MXN'
    },

    // 🕓 Horarios de atención
    opening_hours: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Horarios de atención, ej: {"monday": ["08:00", "18:00"]}'
    },

    // 🦷 Datos específicos de clínica dental
    specialties: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Especialidades ofrecidas, ej. ["ortodoncia", "endodoncia"]'
    },
    number_of_rooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Cantidad de consultorios o gabinetes en la clínica'
    },
}, {
    tableName: 'tenants',
    timestamps: true,
    paranoid: true,
    underscored: false
});

module.exports = Tenant;
