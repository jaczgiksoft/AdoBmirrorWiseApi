// src/modules/patient_gallery/patient_gallery.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./patient_gallery.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { uploadGalleryPhotos } = require('../../middlewares/upload.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { createGalleryValidator } = require('./patient_gallery.validator');

// Todas las rutas requieren autenticación
router.use(validateToken);

/** 
 * @route POST /api/patient-gallery
 * @desc Crea una nueva carpeta y sube fotos
 */
router.post(
    '/',
    uploadGalleryPhotos, // Maneja el multipart/form-data
    createGalleryValidator,
    validateRequest,
    controller.createGallery
);

/**
 * @route GET /api/patient-gallery/patient/:patientId
 * @desc Obtiene todas las carpetas de un paciente
 */
router.get(
    '/patient/:patientId',
    controller.getPatientGallery
);

module.exports = router;
