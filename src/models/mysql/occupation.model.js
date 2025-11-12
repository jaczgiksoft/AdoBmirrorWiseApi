const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Occupation = sequelize.define('Occupation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 💼 Ocupación o profesión
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'Nombre de la ocupación o profesión del paciente'
    },

    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Descripción adicional o categoría de la ocupación'
    }

}, {
    tableName: 'occupations',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices documentados (solo informativos)
    indexes: [
        { fields: ['tenant_id'], name: 'idx_occupations_tenant' },
        { fields: ['name'], name: 'idx_occupations_name' },
        {
            unique: true,
            fields: ['tenant_id', 'name'],
            name: 'uq_occupations_tenant_name'
        }
    ]
});

module.exports = Occupation;
