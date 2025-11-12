const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'Nombre o fuente de referencia del paciente'
    },

    contact_name: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'Persona de contacto si aplica'
    },

    contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    contact_email: {
        type: DataTypes.STRING(120),
        allowNull: true,
        validate: { isEmail: true }
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {
    tableName: 'referrals',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_referrals_tenant' },
        { fields: ['name'], name: 'idx_referrals_name' },
        { fields: ['contact_email'], name: 'idx_referrals_contact_email' },
        {
            unique: true,
            fields: ['tenant_id', 'name'],
            name: 'uq_referrals_tenant_name'
        }
    ]
});

module.exports = Referral;
