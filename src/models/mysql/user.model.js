const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Null si el usuario no está asociado a un empleado'
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Correo de acceso, único globalmente (o por tenant en producción multiinstancia)'
    },

    password: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    is_superadmin: { type: DataTypes.BOOLEAN, defaultValue: false },

    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        allowNull: false,
        defaultValue: 'active'
    },

    last_login_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos para el ORM)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_users_tenant' },
        { fields: ['employee_id'], name: 'idx_users_employee' },
        { fields: ['status'], name: 'idx_users_status' },
        { unique: true, fields: ['email'], name: 'uq_users_email' }
    ]
});

module.exports = User;
