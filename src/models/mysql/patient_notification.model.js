const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientNotification = sequelize.define('PatientNotification', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    notification_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notification_types',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
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
        defaultValue: 'daily'
    },

    repeat_days: {
        type: DataTypes.JSON,
        allowNull: true
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    next_run_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    metadata: {
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
    tableName: 'patient_notifications',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_patient_notifications_tenant' },
        { fields: ['patient_id'], name: 'idx_patient_notifications_patient' },
        { fields: ['notification_type_id'], name: 'idx_patient_notifications_type' },
        { fields: ['is_active'], name: 'idx_patient_notifications_active' }
    ]
});

module.exports = PatientNotification;
