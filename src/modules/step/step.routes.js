const express = require('express');
const router = express.Router();
const stepController = require('./step.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    createStepValidator,
    updateStepValidator,
    getStepByIdValidator
} = require('./step.validator');

// DataTable
router.post('/datatable', validateToken, loadPermissions, checkPermissions('read', 'steps'), stepController.getDatatable);

// CRUD
router.get('/', validateToken, loadPermissions, checkPermissions('read', 'steps'), validateRequest, stepController.getAll);
router.get('/:id', validateToken, loadPermissions, checkPermissions('read', 'steps'), getStepByIdValidator, validateRequest, stepController.getOne);
router.post('/', validateToken, loadPermissions, checkPermissions('write', 'steps'), createStepValidator, validateRequest, stepController.create);
router.put('/:id', validateToken, loadPermissions, checkPermissions('edit', 'steps'), updateStepValidator, validateRequest, stepController.update);
router.delete('/:id', validateToken, loadPermissions, checkPermissions('delete', 'steps'), getStepByIdValidator, validateRequest, stepController.remove);

module.exports = router;
