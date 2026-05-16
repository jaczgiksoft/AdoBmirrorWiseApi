// src/modules/patient_gallery/patient_gallery.controller.js
const patientGalleryService = require('./patient_gallery.service');

const createGallery = async (req, res) => {
    try {
        const { patient_id, name, description, notes } = req.body;
        const files = req.files || [];

        let parsedNotes = {};
        if (notes) {
            try {
                parsedNotes = JSON.parse(notes);
            } catch (e) {
                console.error("Error al parsear notas:", e);
            }
        }

        const result = await patientGalleryService.createGallery(
            patient_id,
            req.user.tenant_id,
            { name, description, notes: parsedNotes },
            files
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPatientGallery = async (req, res) => {
    try {
        const { patientId } = req.params;
        const result = await patientGalleryService.getFolders(patientId, req.user.tenant_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const files = req.files || [];
        
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen para editar.' });
        }

        const file = files[0]; // uploadGalleryPhotos es any(), así que req.files es un array
        const result = await patientGalleryService.updateImage(imageId, req.user.tenant_id, file);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const editImageWithIA = async (req, res) => {
    try {
        const { imageId } = req.params;
        const result = await patientGalleryService.editImageWithIA(imageId, req.user.tenant_id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createGallery,
    getPatientGallery,
    updateImage,
    editImageWithIA
};
