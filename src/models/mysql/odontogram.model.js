// src/models/mysql/odontogram.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Odontogram = sequelize.define('Odontogram', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 👤 Paciente
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🌐 Datos compartidos entre dientes (bracketWires, tads, tadWires)
    global_data: {
        type: DataTypes.JSON,
        allowNull: true
    }

}, {
    tableName: 'odontograms',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Odontogram;
