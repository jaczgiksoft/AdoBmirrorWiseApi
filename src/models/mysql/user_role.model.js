const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const UserRole = sequelize.define('UserRole', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'user_roles',
    timestamps: true,
    paranoid: false,
    underscored: true,

    // 📊 Índices documentados
    indexes: [
        { fields: ['user_id'], name: 'idx_user_roles_user' },
        { fields: ['role_id'], name: 'idx_user_roles_role' },
        { unique: true, fields: ['user_id', 'role_id'], name: 'uq_user_roles_user_role' }
    ]
});

module.exports = UserRole;
