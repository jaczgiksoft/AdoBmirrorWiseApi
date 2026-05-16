const patientGalleryRepository = require('./patient_gallery.repository');
const sequelize = require('../../config/database');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');
const OpenAI = require('openai');
const { toFile } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
                        mime_type: file.mimetype,
                        notes: folderData.notes ? folderData.notes[file.originalname] : null
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

    /**
     * Actualiza una imagen en la galería.
     * El flujo correcto:
     * - La imagen original nunca se modifica físicamente.
     * - Si es la primera vez que se edita, el registro actual se renombra a 'original_' 
     *   y se crea un NUEVO registro para la imagen editada.
     * - Si ya existe la original, simplemente se actualiza el registro editado.
     */
    async updateImage(imageId, tenantId, file) {
        const imageRecord = await patientGalleryRepository.findImageById(imageId);

        if (!imageRecord) {
            throw new Error('Imagen no encontrada.');
        }

        if (imageRecord.folder.tenant_id !== tenantId) {
            throw new Error('No tienes permiso para editar esta imagen.');
        }

        const tempPath = file.path;
        const transaction = await sequelize.transaction();

        try {
            const originalName = imageRecord.file_name;
            const isAlreadyOriginal = originalName.startsWith('original_');
            const backupName = isAlreadyOriginal ? originalName : `original_${originalName}`;

            let finalImageToReturn = imageRecord;

            if (!isAlreadyOriginal) {
                // Buscamos si ya existe el registro de la original
                const existingBackup = await patientGalleryRepository.findImageByFolderAndName(
                    imageRecord.folder_id,
                    backupName,
                    transaction
                );

                if (!existingBackup) {
                    // MODO 1: ES LA PRIMERA VEZ QUE SE EDITA
                    // 1. El registro actual se convierte en la "original"
                    // NUNCA tocamos su archivo físico, solo le cambiamos el nombre en la DB
                    imageRecord.file_name = backupName;
                    await imageRecord.save({ transaction });

                    // 2. Creamos un NUEVO registro para la imagen editada
                    const ext = path.extname(imageRecord.file_path);
                    const baseName = path.basename(imageRecord.file_path, ext);
                    const newFileName = `${baseName}_edit_${Date.now()}${ext}`;
                    const dirName = path.dirname(imageRecord.file_path);
                    const newRelativePath = path.join(dirName, newFileName).replace(/\\/g, '/');
                    const newAbsolutePath = path.join(__dirname, '../../../', newRelativePath);

                    // Movemos el archivo subido a la nueva ruta
                    const destDir = path.dirname(newAbsolutePath);
                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }
                    fs.copyFileSync(tempPath, newAbsolutePath);

                    // Creamos el nuevo registro en DB
                    const newImage = await patientGalleryRepository.createImage({
                        folder_id: imageRecord.folder_id,
                        file_path: newRelativePath,
                        file_name: originalName, // Mantiene el nombre original ("facial_front")
                        mime_type: file.mimetype || imageRecord.mime_type,
                        notes: imageRecord.notes
                    }, transaction);

                    finalImageToReturn = newImage;

                } else {
                    // MODO 2: YA EXISTE LA ORIGINAL (estamos editando una imagen ya editada previamente)
                    // Actualizamos el registro actual
                    const ext = path.extname(imageRecord.file_path);
                    const baseName = path.basename(imageRecord.file_path, ext);
                    const cleanBaseName = baseName.replace(/_edit_\d+$/, '');
                    const newFileName = `${cleanBaseName}_edit_${Date.now()}${ext}`;
                    const dirName = path.dirname(imageRecord.file_path);
                    const newRelativePath = path.join(dirName, newFileName).replace(/\\/g, '/');
                    const newAbsolutePath = path.join(__dirname, '../../../', newRelativePath);

                    // Movemos el nuevo archivo
                    const destDir = path.dirname(newAbsolutePath);
                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }
                    fs.copyFileSync(tempPath, newAbsolutePath);

                    // Borramos el archivo físico antiguo (porque esta es una edición previa, NO la original)
                    const oldAbsolutePath = path.join(__dirname, '../../../', imageRecord.file_path);
                    if (fs.existsSync(oldAbsolutePath)) {
                        fs.unlinkSync(oldAbsolutePath);
                    }

                    // Actualizamos DB
                    imageRecord.file_path = newRelativePath;
                    imageRecord.changed('updated_at', true);
                    await imageRecord.save({ transaction });

                    finalImageToReturn = imageRecord;
                }
            } else {
                // MODO 3: Están intentando editar directamente la que se llama "original_..."
                const ext = path.extname(imageRecord.file_path);
                const baseName = path.basename(imageRecord.file_path, ext);
                const cleanBaseName = baseName.replace(/_edit_\d+$/, '');
                const newFileName = `${cleanBaseName}_edit_${Date.now()}${ext}`;
                const dirName = path.dirname(imageRecord.file_path);
                const newRelativePath = path.join(dirName, newFileName).replace(/\\/g, '/');
                const newAbsolutePath = path.join(__dirname, '../../../', newRelativePath);

                const destDir = path.dirname(newAbsolutePath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                fs.copyFileSync(tempPath, newAbsolutePath);

                const oldAbsolutePath = path.join(__dirname, '../../../', imageRecord.file_path);
                if (fs.existsSync(oldAbsolutePath)) {
                    fs.unlinkSync(oldAbsolutePath);
                }

                imageRecord.file_path = newRelativePath;
                imageRecord.changed('updated_at', true);
                await imageRecord.save({ transaction });

                finalImageToReturn = imageRecord;
            }

            // Limpieza del archivo temporal de multer
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
                const tempDir = path.dirname(tempPath);
                if (fs.existsSync(tempDir)) {
                    try {
                        if (fs.readdirSync(tempDir).length === 0) fs.rmdirSync(tempDir);
                    } catch (e) { /* ignore */ }
                }
            }

            await transaction.commit();

            return {
                message: 'Imagen editada exitosamente.',
                image: finalImageToReturn
            };

        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Error al actualizar imagen: ${error.message}`);

            if (fs.existsSync(tempPath)) {
                try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
            }

            throw new Error(`No se pudo procesar la edición: ${error.message}`);
        }
    }

    /**
     * Edita una imagen utilizando la API de OpenAI.
     */
    async editImageWithIA(imageId, tenantId, options = {}) {
        const imageRecord = await patientGalleryRepository.findImageById(imageId);

        if (!imageRecord) {
            throw new Error('Imagen no encontrada.');
        }

        if (imageRecord.folder.tenant_id !== tenantId) {
            throw new Error('No tienes permiso para editar esta imagen.');
        }

        const absolutePath = path.join(__dirname, '../../../', imageRecord.file_path);
        if (!fs.existsSync(absolutePath)) {
            throw new Error('El archivo físico de la imagen no existe.');
        }

        try {
            // Nota: OpenAI requiere que la imagen sea PNG, cuadrada y menor a 4MB.
            // Si la imagen actual no cumple con esto, fallará a nivel de la API de OpenAI.
            // Se asume que en el flujo real se enviará un formato correcto o se adaptará previamente.

            // El prompt por defecto muy estricto solicitado
            const defaultPrompt = "Mejorar exclusivamente la sonrisa, hacer los dientes más blancos, alineados y estándar, manteniendo el resto de la cara, fondo y elementos exactamente idénticos";
            const promptToUse = options.prompt || defaultPrompt;

            logger.info(`[Patient Gallery IA] Solicitando edición a OpenAI para imagen ${imageId}`);

            // OpenAI SDK requiere un objeto File con MIME type explícito.
            // fs.createReadStream envía 'application/octet-stream' y la API lo rechaza.
            const fileExt = path.extname(absolutePath).toLowerCase();
            const mimeMap = {
                '.jpg':  'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png':  'image/png',
                '.webp': 'image/webp'
            };
            const mimeType = mimeMap[fileExt] || 'image/jpeg';
            const imageFile = await toFile(fs.createReadStream(absolutePath), path.basename(absolutePath), { type: mimeType });

            const response = await openai.images.edit({
                model: "gpt-image-1",
                image: imageFile,
                prompt: promptToUse,
                n: 1,
                size: "1024x1024"
            });

            if (!response.data || response.data.length === 0) {
                throw new Error("No se recibió ninguna imagen de OpenAI.");
            }

            // gpt-image-1 devuelve la imagen como base64, no como URL
            const b64Image = response.data[0].b64_json;
            if (!b64Image) {
                throw new Error("OpenAI no devolvio imagen en la respuesta (b64_json vacío).");
            }
            const buffer = Buffer.from(b64Image, 'base64');

            // Preparar guardado local
            const newSuffix = '.png'; // gpt-image-1 siempre devuelve png
            const baseName = path.basename(imageRecord.file_path, path.extname(imageRecord.file_path));
            const newFileName = `${baseName}_ia_${Date.now()}${newSuffix}`;
            const dirName = path.dirname(imageRecord.file_path);
            const newRelativePath = path.join(dirName, newFileName).replace(/\\/g, '/');
            const newAbsolutePath = path.join(__dirname, '../../../', newRelativePath);

            const destDir = path.dirname(newAbsolutePath);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            fs.writeFileSync(newAbsolutePath, buffer);

            // Guardar registro en BD en tabla separada (patient_gallery_images_ia)
            const newIaImageRecord = await patientGalleryRepository.createIaImage({
                patient_gallery_image_id: imageRecord.id,
                file_path: newRelativePath,
                file_name: newFileName,
                mime_type: 'image/png',
                notes: { prompt: promptToUse }
            });

            return {
                message: 'Imagen generada por IA exitosamente.',
                image: newIaImageRecord
            };

        } catch (error) {
            logger.error(`Error en editImageWithIA: ${error.message}`);
            throw new Error(`Error procesando con OpenAI: ${error.message}`);
        }
    }
}

module.exports = new PatientGalleryService();
