// models/bracket_type.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BracketType = sequelize.define('BracketType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // 🦷 Tipo de bracket ortodóntico
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre del tipo de bracket (ej. Metálico, Cerámico, Autoligado, etc.)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción adicional o notas sobre el tipo de bracket'
    },
    material: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Material base (ej. acero inoxidable, zafiro, cerámica)'
    },
    manufacturer: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Fabricante o marca del bracket si aplica'
    },
    color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
    }

}, {
    tableName: 'bracket_types',
    timestamps: true,
    paranoid: true,
    underscored: false
});

module.exports = BracketType;
