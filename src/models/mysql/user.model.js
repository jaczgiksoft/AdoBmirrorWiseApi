const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },



    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true, // 1:1 strict
        comment: 'User must belong to an employee. 1:1 relationship.'
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
        { unique: true, fields: ['employee_id'], name: 'uq_users_employee_id' },
        { fields: ['status'], name: 'idx_users_status' }
    ]
});

module.exports = User;
