const appointmentService = require('./appointment.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 🟢 Crear nueva cita
const create = async (req, res) => {
    try {
        const appointment = await appointmentService.createAppointment(req.body, req.user, req);
        res.status(201).json({ message: 'Cita creada exitosamente', appointment });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🟡 Actualizar cita existente
const update = async (req, res) => {
    try {
        const appointment = await appointmentService.updateAppointment(req.params.id, req.body, req.user, req);
        res.json({ message: 'Cita actualizada exitosamente', appointment });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📍 Check-In de cita (Kiosco)
const checkIn = async (req, res) => {
    try {
        const { tenant_id } = req.body;
        const appointment = await appointmentService.checkInAppointment(req.params.id, req.user, req, tenant_id || req.query.tenant_id);
        res.json({ message: 'Check-in realizado exitosamente', appointment });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔴 Eliminar cita (borrado lógico)
const remove = async (req, res) => {
    try {
        await appointmentService.deleteAppointment(req.params.id, req.user, req);
        res.json({ message: 'Cita eliminada correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📋 Obtener todas las citas
const getAll = async (req, res) => {
    try {
        const appointments = await appointmentService.getAllAppointments(req.user, req.query);
        res.json(appointments);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📊 DataTable
const getDatatable = async (req, res) => {
    try {
        const result = await appointmentService.getAppointmentsDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔍 Obtener una cita por ID
const getOne = async (req, res) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.id, req.user);
        res.json(appointment);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔍 Buscar citas para el Kiosko
const findKioskAppointments = async (req, res) => {
    try {
        const { phone_number, tenant_id } = req.query;
        if (!phone_number) {
            return res.status(400).json({ message: 'El número de teléfono es requerido' });
        }
        const appointments = await appointmentService.getKioskAppointments(phone_number, req.user, req, tenant_id);
        res.json(appointments);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    create,
    update,
    remove,
    getAll,
    getDatatable,
    getOne,
    findKioskAppointments,
    checkIn
};
