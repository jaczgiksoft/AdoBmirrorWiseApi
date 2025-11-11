const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    user_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },

    // Nuevos campos para POS
    store_id: { type: DataTypes.INTEGER, allowNull: true }, // sucursal/tienda
    current_session_id: { type: DataTypes.INTEGER, allowNull: true }, // sesión de caja activa

    // Datos de usuario
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    second_last_name: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    profile_image: { type: DataTypes.STRING, allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        allowNull: false,
        defaultValue: 'active'
    },
    last_login_at: { type: DataTypes.DATE, allowNull: true },
    is_superadmin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = User;
