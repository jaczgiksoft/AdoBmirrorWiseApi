const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const NotificationTemplate = sequelize.define('NotificationTemplate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notification_categories',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    code: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    title_template: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    message_template: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'es'
    },

    allowed_placeholders: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'notification_templates',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['category_id'], name: 'idx_notification_templates_category' },
        { fields: ['code'], name: 'idx_notification_templates_code' }
    ]
});

module.exports = NotificationTemplate;
