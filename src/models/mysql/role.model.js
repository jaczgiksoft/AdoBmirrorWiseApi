// src/models/mysql/role.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },

    // 🧾 Nuevo campo: indica si el rol requiere sesión de caja al iniciar sesión en el POS
    requires_cash_session: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si este rol debe abrir una cash_session al iniciar sesión en POS'
    }

}, {
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Role;
