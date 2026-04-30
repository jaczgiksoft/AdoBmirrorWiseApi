const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ElasticType = sequelize.define('ElasticType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🦷 Datos del elástico
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre o marca del elástico (ej. Ormco, GAC, etc.)'
    },

    color: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
    },

    type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Tipo (ej. Intraoral, Extraoral)'
    },

    size: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Tamaño (ej. 1/8", 3/16", 1/4", 5/16", 3/8")'
    },

    oz: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Fuerza en onzas (ej. 2.5oz, 3.5oz, 4.5oz, 6oz)'
    }

}, {
    tableName: 'elastic_types',
    timestamps: true,
    paranoid: true,
    underscored: true,

    // 📊 Índices
    indexes: [
        { fields: ['tenant_id'], name: 'idx_elastic_types_tenant' },
        { fields: ['name'], name: 'idx_elastic_types_name' },
        {
            unique: true,
            fields: ['tenant_id', 'name', 'size', 'oz'],
            name: 'uq_elastic_types_tenant_config'
        }
    ]
});

module.exports = ElasticType;
