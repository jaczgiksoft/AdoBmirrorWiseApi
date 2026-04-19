const AttendanceService = require('./attendance.service');
const appointmentService = require('../appointment/appointment.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { validationResult } = require('express-validator');

const getAttendances = async (req, res) => {
    try {
        const filters = {
            employeeId: req.query.employeeId,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };
        const attendances = await AttendanceService.getAllAttendances(filters, req.user.tenant_id);
        res.status(200).json(attendances);
    } catch (err) {
        logger.error(`Error fetching attendances: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const getAttendance = async (req, res) => {
    try {
        const attendance = await AttendanceService.getAttendanceById(req.params.id, req.user.tenant_id);
        res.status(200).json(attendance);
    } catch (err) {
        logger.error(`Error fetching attendance: ${err.message}`);
        await logApiError(req, err);
        res.status(404).json({ success: false, message: err.message });
    }
};

const createAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const attendance = await AttendanceService.createAttendance(req.body, req.user.tenant_id);
        res.status(201).json(attendance);
    } catch (err) {
        logger.error(`Error creating attendance: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const updateAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const attendance = await AttendanceService.updateAttendance(req.params.id, req.body, req.user.tenant_id);
        res.status(200).json(attendance);
    } catch (err) {
        logger.error(`Error updating attendance: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        await AttendanceService.deleteAttendance(req.params.id, req.user.tenant_id);
        res.status(200).json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (err) {
        logger.error(`Error deleting attendance: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// 📲 Check-In por QR (endpoint público — accedido por app móvil / escáner)
const qrCheckIn = async (req, res) => {
    const { token, phoneNumber } = req.body;

    // — Validaciones básicas
    if (!token || !phoneNumber) {
        return res.status(400).json({
            success: false,
            message: 'Se requieren los campos: token y phoneNumber'
        });
    }

    // — Decodificar token Base64
    let tenant_id;
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const payload = JSON.parse(decoded);

        if (!payload?.tenant_id || payload?.type !== 'qr-checkin') {
            return res.status(400).json({ success: false, message: 'Token inválido o malformado' });
        }

        tenant_id = payload.tenant_id;
    } catch {
        return res.status(400).json({ success: false, message: 'Error al decodificar el token QR' });
    }

    try {
        // — Buscar citas de hoy para ese teléfono y tenant
        const appointments = await appointmentService.getKioskAppointments(phoneNumber, null, req, tenant_id);

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron citas para hoy con ese número de teléfono'
            });
        }

        // — Ejecutar check-in en cada cita encontrada
        const checkedIn = await Promise.all(
            appointments.map(appt =>
                appointmentService.checkInAppointment(appt.id, null, req, tenant_id)
            )
        );

        logger.info(`✅ QR Check-In completado para tenant ${tenant_id}, teléfono: ${phoneNumber}`);

        return res.status(200).json({
            success: true,
            message: `Check-In realizado para ${checkedIn.length} cita(s)`,
            appointments: checkedIn.map(a => ({ id: a.id, status: a.status, checkin_at: a.checkin_at }))
        });
    } catch (err) {
        logger.error(`Error en QR Check-In: ${err.message}`);
        await logApiError(req, err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAttendances,
    getAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    qrCheckIn
};
