const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const NotificationType = sequelize.define('NotificationType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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

    icon: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    default_title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    default_message: {
        type: DataTypes.TEXT,
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
    },

    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'notification_types',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_notification_types_tenant' }
    ]
});

module.exports = NotificationType;
