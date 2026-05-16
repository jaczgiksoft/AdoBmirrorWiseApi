// src/modules/patient_gallery/patient_gallery.repository.js
const PatientGalleryFolder = require('../../models/mysql/patient_gallery_folder.model');
const PatientGalleryImage = require('../../models/mysql/patient_gallery_image.model');
const PatientGalleryImageIA = require('../../models/mysql/patient_gallery_image_ia.model');

class PatientGalleryRepository {
    async createFolder(data, transaction = null) {
        return await PatientGalleryFolder.create(data, { transaction });
    }

    async createImage(data, transaction = null) {
        return await PatientGalleryImage.create(data, { transaction });
    }

    async createIaImage(data, transaction = null) {
        return await PatientGalleryImageIA.create(data, { transaction });
    }

    async findFoldersByPatient(patient_id, tenant_id) {
        return await PatientGalleryFolder.findAll({
            where: { patient_id, tenant_id },
            include: [
                {
                    model: PatientGalleryImage,
                    as: 'images',
                    include: [
                        {
                            model: PatientGalleryImageIA,
                            as: 'ia_images'
                        }
                    ]
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
                    as: 'images',
                    include: [
                        {
                            model: PatientGalleryImageIA,
                            as: 'ia_images'
                        }
                    ]
                }
            ]
        });
    }

    async findImageById(id) {
        return await PatientGalleryImage.findByPk(id, {
            include: [
                {
                    model: PatientGalleryFolder,
                    as: 'folder' // Need to check if alias is 'folder'
                }
            ]
        });
    }

    async findImageByFolderAndName(folder_id, file_name, transaction = null) {
        return await PatientGalleryImage.findOne({
            where: { folder_id, file_name },
            transaction
        });
    }
}

module.exports = new PatientGalleryRepository();
