const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware'); // Asumiendo que usamos 'employees' como modulo de permiso
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const {
    employeeValidationRules,
    employeeIdValidator
} = require('./employee.validator');

const { uploadEmployeePhoto } = require('../../middlewares/upload.middleware');
const parseJsonFields = require('../../middlewares/parseJsonFields.middleware');

// =========================
// RUTAS EMPLEADOS
// =========================

// 👨‍⚕️ Obtener lista de doctores (endpoint ligero para selects)
// NOTA: Se coloca antes de /:id para evitar conflicto de rutas
router.get(
    '/options/doctors',
    validateToken,
    loadPermissions,
    // checkPermissions('read', 'appointments'), // Permitir si tiene acceso a citas? O a empleados?
    // Usaremos acceso básico de lectura o autenticado para selects?
    // Por seguridad, requerimos login, y quizás permiso de lectura genérico.
    // De momento, validamos solo token si es para uso general en selects.
    employeeController.getDoctors
);


// 📋 Listar todos
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'employees'),
    employeeController.getAll
);

// 📊 Datatable
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'employees'),
    employeeController.getDatatable
);

// 🔍 Obtener uno
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'employees'),
    employeeIdValidator,
    validateRequest,
    employeeController.getOne
);

// 🟢 Crear
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'employees'),
    uploadEmployeePhoto,
    parseJsonFields,
    employeeValidationRules,
    validateRequest,
    employeeController.create
);

// 🟡 Actualizar
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'employees'),
    uploadEmployeePhoto,
    parseJsonFields,
    employeeIdValidator,
    employeeValidationRules,
    validateRequest,
    employeeController.update
);

// 🔴 Eliminar
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'employees'),
    employeeIdValidator,
    validateRequest,
    employeeController.softDelete
);

module.exports = router;
