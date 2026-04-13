const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Position = sequelize.define('Position', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 💼 Puesto de trabajo
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'Nombre del puesto de trabajo'
    },

    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Descripción de funciones del puesto'
    },

    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#6366f1',
        comment: 'Color identificador para la UI'
    },

    is_appointment_eligible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si el puesto puede recibir citas agendadas'
    },

    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    }

}, {
    tableName: 'positions',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_positions_tenant' },
        { fields: ['name'], name: 'idx_positions_name' },
        {
            unique: true,
            fields: ['tenant_id', 'name'],
            name: 'uq_positions_tenant_name'
        }
    ]
});

module.exports = Position;
