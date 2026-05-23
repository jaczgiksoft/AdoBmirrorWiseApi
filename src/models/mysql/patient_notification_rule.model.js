const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientNotificationRule = sequelize.define('PatientNotificationRule', {
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

    custom_title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    custom_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    end_time: {
        type: DataTypes.TIME,
        allowNull: true
    },

    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    repeat_type: {
        type: DataTypes.ENUM('once', 'daily', 'weekly', 'monthly', 'custom'),
        allowNull: false,
        defaultValue: 'once'
    },

    repeat_days: {
        type: DataTypes.JSON,
        allowNull: true
    },

    next_run_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    context_data: {
        type: DataTypes.JSON,
        allowNull: true
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}, {
    tableName: 'patient_notification_rules',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_notification_rules_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_notification_rules_patient' },
        { fields: ['template_id'], name: 'idx_patient_notification_rules_template' },
        { fields: ['is_active'], name: 'idx_patient_notification_rules_active' },
        { fields: ['next_run_at'], name: 'idx_patient_notification_rules_next_run' }
    ]
});

module.exports = PatientNotificationRule;
