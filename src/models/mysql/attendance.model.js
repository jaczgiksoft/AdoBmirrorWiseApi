const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    check_in: {
        type: DataTypes.TIME,
        allowNull: true
    },
    check_out: {
        type: DataTypes.TIME,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('present', 'late', 'absent'),
        defaultValue: 'present'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'attendances',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_attendances_tenant' },
        { fields: ['employee_id'], name: 'idx_attendances_employee' },
        { fields: ['date'], name: 'idx_attendances_date' },
        {
            unique: true,
            fields: ['tenant_id', 'employee_id', 'date'],
            name: 'uq_attendances_tenant_employee_date'
        }
    ]
});

module.exports = Attendance;
