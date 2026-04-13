const AttendanceService = require('./attendance.service');
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

module.exports = {
    getAttendances,
    getAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
};
