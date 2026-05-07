const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    second_last_name: { type: DataTypes.STRING, allowNull: true },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Puede o no coincidir con la cuenta de usuario asociada'
    },
    is_appointment_eligible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indicates whether the employee can be assigned to appointments (citas)'
    },
    profile_image: { type: DataTypes.STRING, allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    full_name: {
        type: DataTypes.VIRTUAL,
        get() {
            return `${this.first_name} ${this.last_name} ${this.second_last_name || ''}`.trim();
        }
    }
}, {
    tableName: 'employees',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_employees_tenant' },
        { fields: ['status'], name: 'idx_employees_status' },
        { fields: ['email'], name: 'idx_employees_email' },
        {
            unique: true,
            fields: ['tenant_id', 'email'],
            name: 'uq_employees_tenant_email'
        }
    ]
});

module.exports = Employee;
