// src/modules/patient_gallery/patient_gallery.service.js
const patientGalleryRepository = require('./patient_gallery.repository');
const sequelize = require('../../config/database');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');

class PatientGalleryService {
    /**
     * Crea una nueva colección (carpeta) y guarda sus imágenes en la base de datos y disco.
     */
    async createGallery(patientId, tenantId, folderData, files) {
        const transaction = await sequelize.transaction();
        try {
            // 1. Crear el registro de la carpeta
            const folder = await patientGalleryRepository.createFolder({
                patient_id: patientId,
                tenant_id: tenantId,
                name: folderData.name,
                description: folderData.description
            }, transaction);

            // 2. Si hay archivos, procesarlos
            if (files && files.length > 0) {
                // Renombramos el directorio temporal de multer a uno definitivo basado en el ID de la carpeta
                const tempDir = path.dirname(files[0].path);
                const finalFolderName = `folder_${folder.id}`;
                const finalDir = path.join(path.dirname(tempDir), finalFolderName);

                if (fs.existsSync(tempDir)) {
                    fs.renameSync(tempDir, finalDir);
                }

                for (const file of files) {
                    // Actualizamos la ruta local para reflejar el renombramiento del directorio
                    const updatedPath = file.path.replace(tempDir, finalDir);
                    
                    // Preparamos la ruta relativa para la base de datos (Ej: uploads/...)
                    const normalizedPath = updatedPath.replace(/\\/g, '/');
                    const uploadIdx = normalizedPath.indexOf('uploads/');
                    const dbRelativePath = uploadIdx !== -1 ? normalizedPath.substring(uploadIdx) : normalizedPath;

                    await patientGalleryRepository.createImage({
                        folder_id: folder.id,
                        file_path: dbRelativePath,
                        file_name: file.originalname,
                        mime_type: file.mimetype
                    }, transaction);
                }
            }

            await transaction.commit();
            
            // Retornamos la carpeta con sus imágenes
            return await patientGalleryRepository.findFolderById(folder.id, tenantId);
        } catch (error) {
            if (transaction) await transaction.rollback();
            
            // Limpieza: si falló algo, intentar borrar los archivos subidos
            if (files && files.length > 0) {
                try {
                    const tempDir = path.dirname(files[0].path);
                    if (fs.existsSync(tempDir)) {
                        fs.rmSync(tempDir, { recursive: true, force: true });
                    }
                } catch (cleanupError) {
                    logger.error(`Error al limpiar archivos tras fallo: ${cleanupError.message}`);
                }
            }
            
            throw error;
        }
    }

    /**
     * Obtiene todas las galerías de un paciente.
     */
    async getPatientGallery(patientId, tenantId) {
        const folders = await patientGalleryRepository.findFoldersByPatient(patientId, tenantId);
        
        // Formateamos las colecciones para que el frontend las use fácilmente
        return folders.map(folder => {
            const folderJson = folder.get({ plain: true });
            const photos = {};
            const x_rays = [];

            folderJson.images.forEach(img => {
                // Intentamos identificar si es una de las 8 fotos obligatorias por el nombre del campo original
                // En el frontend, el campo se envía con el nombre de la llave (facial_front, etc.)
                // multer guarda eso en fieldname
                
                // NOTA: Para que esto funcione, GalleryCreator debe enviar los fieldnames correctos.
                // Si vienen como array genérico, los pondremos todos en x_rays o similar.
                // Pero el requerimiento dice que debemos mostrar 8 fijos + xrays.
                
                // Por ahora, asumiremos que si el fieldname no es 'radiographs' o similar, 
                // es una de las fotos obligatorias.
            });

            return folderJson;
        });
    }

    async getFolders(patientId, tenantId) {
        return await patientGalleryRepository.findFoldersByPatient(patientId, tenantId);
    }
}

module.exports = new PatientGalleryService();
