// models/patient_profession.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientProfession = sequelize.define('PatientProfession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // 🎓 Profesión o título del paciente
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre o título profesional (ej. Dr., Lic., Ing., C.D., Mtro.)'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Descripción o detalle del título profesional'
    },
    abbreviation: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Abreviatura estándar (ej. Dr., Mtra., C.D.)'
    },
    color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '#CCCCCC',
        comment: 'Color distintivo para UI'
    }
}, {
    tableName: 'patient_professions',
    timestamps: true,
    paranoid: true,
    underscored: false
});

module.exports = PatientProfession;
