// src/modules/patient_gallery/patient_gallery.repository.js
const PatientGalleryFolder = require('../../models/mysql/patient_gallery_folder.model');
const PatientGalleryImage = require('../../models/mysql/patient_gallery_image.model');

class PatientGalleryRepository {
    async createFolder(data, transaction = null) {
        return await PatientGalleryFolder.create(data, { transaction });
    }

    async createImage(data, transaction = null) {
        return await PatientGalleryImage.create(data, { transaction });
    }

    async findFoldersByPatient(patient_id, tenant_id) {
        return await PatientGalleryFolder.findAll({
            where: { patient_id, tenant_id },
            include: [
                {
                    model: PatientGalleryImage,
                    as: 'images'
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findFolderById(id, tenant_id) {
        return await PatientGalleryFolder.findOne({
            where: { id, tenant_id },
            include: [
                {
                    model: PatientGalleryImage,
                    as: 'images'
                }
            ]
        });
    }
}

module.exports = new PatientGalleryRepository();
