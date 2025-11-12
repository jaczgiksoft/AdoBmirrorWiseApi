const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del rol, ej: admin, doctor, recepcionista'
    },

    // 🧾 Indica si requiere sesión de caja (para POS)
    requires_cash_session: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si este rol debe iniciar una sesión de caja al entrar al POS'
    }
}, {
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (coherentes con la futura migración)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_roles_tenant' },
        { unique: true, fields: ['tenant_id', 'name'], name: 'uq_roles_tenant_name' }, // evita duplicados dentro del mismo tenant
        { fields: ['requires_cash_session'], name: 'idx_roles_cash_session' }
    ]
});

module.exports = Role;
