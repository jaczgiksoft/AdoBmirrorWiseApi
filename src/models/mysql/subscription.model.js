// src/models/mysql/subscription.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Subscription = sequelize.define('Subscription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' }
    },
    plan_name: { type: DataTypes.STRING, allowNull: false }, // Ej: Basic, Pro, Enterprise
    start_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    end_date: { type: DataTypes.DATE, allowNull: false },
    max_users: { type: DataTypes.INTEGER, allowNull: false },
    price_monthly: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    extra_user_price: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'canceled'),
        defaultValue: 'active'
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = Subscription;
