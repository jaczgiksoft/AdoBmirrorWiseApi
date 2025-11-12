const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientAlert = sequelize.define('PatientAlert', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    // 👤 Paciente asociado
    patient_id: { type: DataTypes.INTEGER, allowNull: false },

    // 📢 Información de la alerta
    title: { type: DataTypes.STRING(150), allowNull: false },   // Ej: "Alergia a penicilina"
    description: { type: DataTypes.TEXT, allowNull: true },

    // ⚙️ Nueva propiedad
    is_admin_alert: { type: DataTypes.BOOLEAN, defaultValue: false }, // 🔹 True = alerta administrativa

}, {
    tableName: 'patient_alerts',
    timestamps: true,
    paranoid: false,
    underscored: false,
});

module.exports = PatientAlert;
