// src/models/mysql/periodontogram.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Periodontogram = sequelize.define('Periodontogram', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    exam_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    teeth_data: {
        type: DataTypes.JSON,
        allowNull: false
    },

    odontogram_states: {
        type: DataTypes.JSON,
        allowNull: true
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {
    tableName: 'periodontograms',
    timestamps: true,
    paranoid: true,
    underscored: true
});

module.exports = Periodontogram;
