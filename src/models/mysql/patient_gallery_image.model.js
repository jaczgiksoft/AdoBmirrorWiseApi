// src/models/mysql/patient_gallery_image.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PatientGalleryImage = sequelize.define('PatientGalleryImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    folder_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'patient_gallery_folders', key: 'id' }
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'patient_gallery_images',
    timestamps: true,
    underscored: true
});

module.exports = PatientGalleryImage;
