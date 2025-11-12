const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TenantModule = sequelize.define('TenantModule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    module: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del módulo, ej: users, hr, cctv'
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Define si el módulo está activo para el tenant'
    }
}, {
    tableName: 'tenant_modules',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos para ORM)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_tenant_modules_tenant' },
        { fields: ['module'], name: 'idx_tenant_modules_module' },
        {
            unique: true,
            fields: ['tenant_id', 'module'],
            name: 'uq_tenant_modules_tenant_module'
        }
    ]
});

module.exports = TenantModule;
