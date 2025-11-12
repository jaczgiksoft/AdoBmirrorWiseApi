const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Permission = sequelize.define('Permission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    module: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Identificador del módulo (ej: patients, billing, users)'
    },

    can_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_write: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_edit: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_delete: { type: DataTypes.BOOLEAN, defaultValue: false }

}, {
    tableName: 'permissions',
    timestamps: false,
    underscored: true,

    // 📊 Índices documentados (para ORM)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_permissions_tenant' },
        { fields: ['role_id'], name: 'idx_permissions_role' },
        { fields: ['module'], name: 'idx_permissions_module' },
        {
            unique: true,
            fields: ['role_id', 'module'],
            name: 'uq_permissions_role_module'
        }
    ]
});

module.exports = Permission;
