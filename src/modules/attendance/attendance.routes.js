const express = require('express');
const attendanceController = require('./attendance.controller');
const attendanceValidator = require('./attendance.validator');
const { validateToken } = require('../../middlewares/auth.middleware');
const loadPermissions = require('../../middlewares/loadPermissions.middleware');
const { checkPermissions } = require('../../middlewares/permissions.middleware');

const router = express.Router();

// 📲 QR Check-In público (sin autenticación de empleado — accedido por escaner o app móvil del paciente)
router.post('/qr-checkin', attendanceController.qrCheckIn);

// All routes below are protected
router.use(validateToken);
router.use(loadPermissions);

router.get('/',
    checkPermissions('read', 'attendance'),
    attendanceController.getAttendances
);

router.get('/:id',
    checkPermissions('read', 'attendance'),
    attendanceController.getAttendance
);

router.post('/',
    checkPermissions('write', 'attendance'),
    attendanceValidator.createAttendance,
    attendanceController.createAttendance
);

router.put('/:id',
    checkPermissions('edit', 'attendance'),
    attendanceValidator.updateAttendance,
    attendanceController.updateAttendance
);

router.delete('/:id',
    checkPermissions('delete', 'attendance'),
    attendanceController.deleteAttendance
);

module.exports = router;
