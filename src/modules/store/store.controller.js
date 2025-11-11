// src/modules/store/store.controller.js
const storeService = require('./store.service');

/**
 * 📋 Obtener todas las tiendas del tenant actual
 */
const getAll = async (req, res) => {
    try {
        const stores = await storeService.getAllStores(req.user);
        res.json(stores);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

/**
 * 🔍 Obtener una tienda por ID
 */
const getOne = async (req, res) => {
    try {
        const store = await storeService.getStoreById(req.params.id, req.user);
        res.json(store);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/**
 * 🟢 Crear nueva tienda
 */
const create = async (req, res) => {
    try {
        // req.files puede contener logo y banner (según configuración de multer)
        const logoFile = req.files?.logo?.[0] || null;
        const bannerFile = req.files?.banner?.[0] || null;

        const store = await storeService.createStore(req.body, req.user, req, logoFile, bannerFile);
        res.status(201).json({ message: 'Tienda creada correctamente', store });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * 🟡 Actualizar tienda
 */
const update = async (req, res) => {
    try {
        const logoFile = req.files?.logo?.[0] || null;
        const bannerFile = req.files?.banner?.[0] || null;

        const store = await storeService.updateStore(req.params.id, req.body, req.user, req, logoFile, bannerFile);
        res.json({ message: 'Tienda actualizada correctamente', store });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * 🔴 Eliminar tienda (soft delete)
 */
const softDelete = async (req, res) => {
    try {
        await storeService.deleteStore(req.params.id, req.user, req);
        res.json({ message: 'Tienda eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * 📊 Datatable de tiendas
 */
const getDatatable = async (req, res) => {
    try {
        const result = await storeService.getStoresDatatable(req.body, req.user);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    softDelete,
    getDatatable,
};
