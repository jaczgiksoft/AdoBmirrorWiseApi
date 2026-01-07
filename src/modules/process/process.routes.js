const express = require('express');
const router = express.Router();
const processController = require('./process.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    createProcessValidator,
    updateProcessValidator,
    getProcessByIdValidator
} = require('./process.validator');

// DataTable
router.post('/datatable', validateToken, loadPermissions, checkPermissions('read', 'processes'), processController.getDatatable);

// CRUD
router.get('/', validateToken, loadPermissions, checkPermissions('read', 'processes'), validateRequest, processController.getAll);
router.get('/:id', validateToken, loadPermissions, checkPermissions('read', 'processes'), getProcessByIdValidator, validateRequest, processController.getOne);
router.post('/', validateToken, loadPermissions, checkPermissions('write', 'processes'), createProcessValidator, validateRequest, processController.create);
router.put('/:id', validateToken, loadPermissions, checkPermissions('edit', 'processes'), updateProcessValidator, validateRequest, processController.update);
router.delete('/:id', validateToken, loadPermissions, checkPermissions('delete', 'processes'), getProcessByIdValidator, validateRequest, processController.remove);

module.exports = router;
