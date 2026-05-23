const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const NotificationCategory = sequelize.define('NotificationCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tenants',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    icon: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    is_system: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'notification_categories',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_notification_categories_tenant' },
        { fields: ['is_active'], name: 'idx_notification_categories_active' }
    ]
});

module.exports = NotificationCategory;
