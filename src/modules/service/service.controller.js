const serviceService = require('./service.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 🟢 Crear nuevo servicio
const create = async (req, res) => {
    try {
        const service = await serviceService.createService(req.body, req.user, req);
        res.status(201).json({ message: 'Servicio creado exitosamente', service });
    } catch (err) {
        handleSequelizeError(res, err, {
            name: 'Ya existe un servicio con ese nombre.'
        });
    }
};

// 🟡 Actualizar servicio existente
const update = async (req, res) => {
    try {
        const service = await serviceService.updateService(req.params.id, req.body, req.user, req);
        res.json({ message: 'Servicio actualizado exitosamente', service });
    } catch (err) {
        handleSequelizeError(res, err, {
            name: 'Ya existe un servicio con ese nombre.'
        });
    }
};

// 🔴 Eliminar servicio (borrado lógico)
const remove = async (req, res) => {
    try {
        await serviceService.deleteService(req.params.id, req.user, req);
        res.json({ message: 'Servicio eliminado correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📋 Obtener todos los servicios
const getAll = async (req, res) => {
    try {
        const services = await serviceService.getAllServices(req.user);
        res.json(services);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📊 DataTable (listado con filtros)
const getDatatable = async (req, res) => {
    try {
        const result = await serviceService.getServicesDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔍 Obtener un servicio por ID
const getOne = async (req, res) => {
    try {
        const service = await serviceService.getServiceById(req.params.id, req.user);
        res.json(service);
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
