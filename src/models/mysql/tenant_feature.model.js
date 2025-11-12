const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TenantFeature = sequelize.define('TenantFeature', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    feature: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de la funcionalidad o submódulo habilitado para el tenant'
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la funcionalidad está activa para este tenant'
    }
}, {
    tableName: 'tenant_features',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos para ORM)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_tenant_features_tenant' },
        { fields: ['feature'], name: 'idx_tenant_features_feature' },
        {
            unique: true,
            fields: ['tenant_id', 'feature'],
            name: 'uq_tenant_features_tenant_feature'
        }
    ]
});

module.exports = TenantFeature;
