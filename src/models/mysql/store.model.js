const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Store = sequelize.define('Store', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // Identidad / branding
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    logo_url: { type: DataTypes.STRING, allowNull: true },
    banner_url: { type: DataTypes.STRING, allowNull: true },

    // Contacto / Ubicación
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    postal_code: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },

    // Datos fiscales (override si use_parent_tax_data = false)
    tax_id: { type: DataTypes.STRING, allowNull: true },
    legal_name: { type: DataTypes.STRING, allowNull: true },
    regime: { type: DataTypes.STRING, allowNull: true },
    certificate_path: { type: DataTypes.STRING, allowNull: true },
    key_path: { type: DataTypes.STRING, allowNull: true },
    certificate_password: { type: DataTypes.STRING, allowNull: true },
    use_parent_tax_data: { type: DataTypes.BOOLEAN, defaultValue: true },

    // Configuración POS
    timezone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'America/Hermosillo',
    },
    opening_hours: { type: DataTypes.JSON, allowNull: true },
    currency: { type: DataTypes.STRING, defaultValue: 'MXN' },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Tipo de cambio del dólar respecto a la moneda local (MXN)',
    },
    profit_margin: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Margen de ganancia local de la tienda (override del tenant)',
    },
    use_parent_config: { type: DataTypes.BOOLEAN, defaultValue: true },

    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    }
}, {
    tableName: 'stores',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Store;
