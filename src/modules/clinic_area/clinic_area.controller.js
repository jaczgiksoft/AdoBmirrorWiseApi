const clinicAreaService = require('./clinic_area.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

// 🟢 Crear nueva área clínica
const create = async (req, res) => {
    try {
        const clinicArea = await clinicAreaService.createClinicArea(req.body, req.user, req);
        res.status(201).json({ message: 'Área clínica creada exitosamente', clinicArea });
    } catch (err) {
        handleSequelizeError(res, err, {
            name: 'Ya existe un área clínica con ese nombre.'
        });
    }
};

// 🟡 Actualizar área clínica existente
const update = async (req, res) => {
    try {
        const clinicArea = await clinicAreaService.updateClinicArea(req.params.id, req.body, req.user, req);
        res.json({ message: 'Área clínica actualizada exitosamente', clinicArea });
    } catch (err) {
        handleSequelizeError(res, err, {
            name: 'Ya existe un área clínica con ese nombre.'
        });
    }
};

// 🔴 Eliminar área clínica (borrado lógico)
const remove = async (req, res) => {
    try {
        await clinicAreaService.deleteClinicArea(req.params.id, req.user, req);
        res.json({ message: 'Área clínica eliminada correctamente' });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📋 Obtener todas las áreas clínicas
const getAll = async (req, res) => {
    try {
        const clinicAreas = await clinicAreaService.getAllClinicAreas(req.user);
        res.json(clinicAreas);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 📊 DataTable (listado con filtros)
const getDatatable = async (req, res) => {
    try {
        const result = await clinicAreaService.getClinicAreasDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

// 🔍 Obtener un área clínica por ID
const getOne = async (req, res) => {
    try {
        const clinicArea = await clinicAreaService.getClinicAreaById(req.params.id, req.user);
        res.json(clinicArea);
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
