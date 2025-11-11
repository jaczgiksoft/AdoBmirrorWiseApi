const express = require('express');
const router = express.Router();

const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const userController = require('./user.controller');
const { createUserValidator, updateUserValidator, getUserByIdValidator } = require('./user.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const checkUserCreation = require('../../middlewares/checkUserCreation.middleware');
const { uploadUserProfile } = require('../../middlewares/upload.middleware');

// =====================
// USERS ROUTES
// =====================
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'users'),
    userController.getAll
);

router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'users'),
    getUserByIdValidator,
    validateRequest,
    userController.getById
);

// 🔹 DataTable debe ir ANTES de create
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'users'),
    userController.getDatatable
);

router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'users'),
    uploadUserProfile,
    checkUserCreation,
    createUserValidator,
    validateRequest,
    userController.create
);

router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'users'),
    updateUserValidator,
    validateRequest,
    userController.update
);

router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'users'),
    getUserByIdValidator,
    validateRequest,
    userController.softDelete
);

module.exports = router;
