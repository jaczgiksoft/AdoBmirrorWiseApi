const express = require('express');
const router = express.Router();
const treatmentCatalogController = require('./treatment_catalog.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

router.get('/', validateToken, treatmentCatalogController.getAll);

module.exports = router;
