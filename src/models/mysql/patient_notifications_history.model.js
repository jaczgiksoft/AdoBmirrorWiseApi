const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientNotificationHistory = sequelize.define('PatientNotificationHistory', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tenants',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    template_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'notification_templates',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },

    final_title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    final_message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    sent_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    status: {
        type: DataTypes.ENUM('sent', 'failed', 'opened'),
        allowNull: false,
        defaultValue: 'sent'
    },

    failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },

    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'patient_notifications_history',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_notifications_history_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_notifications_history_patient' },
        { fields: ['template_id'], name: 'idx_patient_notifications_history_template' }
    ]
});

module.exports = PatientNotificationHistory;
