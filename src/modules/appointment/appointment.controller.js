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

module.exports = {
    create,
    update,
    remove,
    getAll,
    getDatatable,
    getOne,
};
