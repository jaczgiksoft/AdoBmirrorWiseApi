const serviceService = require('./service.service');

// 🟢 Crear nuevo servicio
const create = async (req, res) => {
    try {
        const service = await serviceService.createService(req.body, req.user, req);
        res.status(201).json({ message: 'Servicio creado exitosamente', service });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar servicio existente
const update = async (req, res) => {
    try {
        const service = await serviceService.updateService(req.params.id, req.body, req.user, req);
        res.json({ message: 'Servicio actualizado exitosamente', service });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar servicio (borrado lógico)
const remove = async (req, res) => {
    try {
        await serviceService.deleteService(req.params.id, req.user, req);
        res.json({ message: 'Servicio eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener todos los servicios
const getAll = async (req, res) => {
    try {
        const services = await serviceService.getAllServices(req.user);
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔍 Obtener un servicio por ID
const getOne = async (req, res) => {
    try {
        const service = await serviceService.getServiceById(req.params.id, req.user);
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne,
};
