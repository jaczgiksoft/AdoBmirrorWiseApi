// src/models/mysql/patient_gallery_folder.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientGalleryFolder = sequelize.define('PatientGalleryFolder', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patients', key: 'id' }
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'patient_gallery_folders',
    timestamps: true,
    underscored: true
});

module.exports = PatientGalleryFolder;
