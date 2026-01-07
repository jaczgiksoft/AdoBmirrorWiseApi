const employeeService = require('./employee.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 📋 Listar todos
const getAll = async (req, res) => {
    try {
        const employees = await employeeService.getAllEmployees(req.user);
        res.json(employees);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📊 Datatable
const getDatatable = async (req, res) => {
    try {
        const result = await employeeService.getDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔍 Obtener uno
const getOne = async (req, res) => {
    try {
        const result = await employeeService.getEmployeeById(req.params.id, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🟢 Crear
const create = async (req, res) => {
    try {
        const result = await employeeService.createEmployee(req.body, req.user, req);
        res.status(201).json({ message: 'Empleado creado correctamente', data: result });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🟡 Actualizar
const update = async (req, res) => {
    try {
        const result = await employeeService.updateEmployee(req.params.id, req.body, req.user, req);
        res.json({ message: 'Empleado actualizado correctamente', data: result });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔴 Eliminar
const softDelete = async (req, res) => {
    try {
        await employeeService.deleteEmployee(req.params.id, req.user, req);
        res.json({ message: 'Empleado eliminado correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 👨‍⚕️ Obtener lista de doctores (opciones)
const getDoctors = async (req, res) => {
    try {
        const doctors = await employeeService.getDoctors(req.user);
        res.json(doctors);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    getAll,
    getDatatable,
    getOne,
    create,
    update,
    softDelete,
    getDoctors
};
