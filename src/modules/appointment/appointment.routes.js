const express = require('express');
const router = express.Router();

const appointmentController = require('./appointment.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');
const {
    createAppointmentValidator,
    updateAppointmentValidator,
    getAppointmentByIdValidator,
    getAppointmentsByPatientValidator,
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

// 🔍 Buscar citas para el Kiosko (por teléfono)
router.get(
    '/kiosk/find',
    appointmentController.findKioskAppointments
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

// 🔍 Obtener citas por Paciente (Acceso Mobile sin checkPermissions)
router.get(
    '/patient-mobile/:patient_id',
    validateToken,
    getAppointmentsByPatientValidator,
    validateRequest,
    appointmentController.getByPatient
);

// 🔍 Obtener citas por Paciente
router.get(
    '/patient/:patient_id',
    validateToken,
    loadPermissions,
    checkPermissions('read', 'appointments'),
    getAppointmentsByPatientValidator,
    validateRequest,
    appointmentController.getByPatient
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

// 📍 Check-In de cita (Kiosco)
router.patch(
    '/:id/check-in',
    getAppointmentByIdValidator,
    validateRequest,
    appointmentController.checkIn
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
