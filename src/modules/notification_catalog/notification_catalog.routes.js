const express = require('express');
const notificationCatalogController = require('./notification_catalog.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const {
    createCategoryValidator,
    updateCategoryValidator,
    createTemplateValidator,
    updateTemplateValidator
} = require('./notification_catalog.validator');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren autenticación

// ==========================================
// CATEGORIES
// ==========================================
router.get('/categories', notificationCatalogController.getAllCategories);
router.get('/categories/:id', notificationCatalogController.getCategoryById);
router.post('/categories', createCategoryValidator, validateRequest, notificationCatalogController.createCategory);
router.put('/categories/:id', updateCategoryValidator, validateRequest, notificationCatalogController.updateCategory);
router.delete('/categories/:id', notificationCatalogController.removeCategory);

// ==========================================
// TEMPLATES
// ==========================================
router.get('/templates', notificationCatalogController.getAllTemplates);
router.get('/templates/:id', notificationCatalogController.getTemplateById);
router.post('/templates', createTemplateValidator, validateRequest, notificationCatalogController.createTemplate);
router.put('/templates/:id', updateTemplateValidator, validateRequest, notificationCatalogController.updateTemplate);
router.delete('/templates/:id', notificationCatalogController.removeTemplate);

module.exports = router;
