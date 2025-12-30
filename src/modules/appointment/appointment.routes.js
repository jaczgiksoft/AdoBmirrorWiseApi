const express = require('express');
const router = express.Router();

const appointmentController = require('./appointment.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createAppointmentValidator,
    updateAppointmentValidator,
    getAppointmentByIdValidator,
} = require('./appointment.validator');
const { validateRequest } = require('../../middlewares/validate.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');

// =========================
// RUTAS CITAS
// =========================

// 📊 DataTable citas
router.post(
    '/datatable',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'appointments'),
    appointmentController.getDatatable
);

// 📋 Obtener todas las citas
router.get(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'appointments'),
    validateRequest,
    appointmentController.getAll
);

// 🔍 Obtener una cita por ID
router.get(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'appointments'),
    getAppointmentByIdValidator,
    validateRequest,
    appointmentController.getOne
);

// 🟢 Crear nueva cita
router.post(
    '/',
    validateToken,
    loadPermissions,
    checkPermissions('write', 'appointments'),
    createAppointmentValidator,
    validateRequest,
    appointmentController.create
);

// 🟡 Actualizar cita
router.put(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('edit', 'appointments'),
    updateAppointmentValidator,
    validateRequest,
    appointmentController.update
);

// 🔴 Eliminar cita
router.delete(
    '/:id',
    validateToken,
    loadPermissions,
    checkPermissions('delete', 'appointments'),
    getAppointmentByIdValidator,
    validateRequest,
    appointmentController.remove
);

module.exports = router;
