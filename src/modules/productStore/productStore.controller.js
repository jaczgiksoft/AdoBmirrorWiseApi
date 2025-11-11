// src/modules/productStore/productStore.controller.js
const productStoreService = require('./productStore.service');

/**
 * 🔹 Obtener todos los productos de una tienda
 */
const getAll = async (req, res) => {
    try {
        const productStores = await productStoreService.getAllProductStores(req.user, req.params.storeId);
        res.json(productStores);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

/**
 * 🔹 Obtener un producto en tienda por su ID
 */
const getOne = async (req, res) => {
    try {
        const productStore = await productStoreService.getProductStoreById(req.params.id, req.params.storeId, req.user);
        res.json(productStore);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/**
 * 🟢 Crear relación producto ↔ tienda
 */
const create = async (req, res) => {
    try {
        const productStore = await productStoreService.createProductStore(req.body, req.user, req);
        res.status(201).json({
            message: 'Producto asignado correctamente a la tienda',
            productStore,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * 🟡 Actualizar relación producto ↔ tienda
 */
const update = async (req, res) => {
    try {
        const productStore = await productStoreService.updateProductStore(
            req.params.id,
            req.body,
            req.params.storeId,
            req.user,
            req
        );
        res.json({
            message: 'Configuración de producto en tienda actualizada correctamente',
            productStore,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * 🔴 Eliminar (soft delete) producto ↔ tienda
 */
const softDelete = async (req, res) => {
    try {
        await productStoreService.deleteProductStore(req.params.id, req.params.storeId, req.user, req);
        res.json({ message: 'Producto eliminado de la tienda correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * 📊 Obtener datatable de productos por tienda
 */
const getDatatable = async (req, res) => {
    try {
        const result = await productStoreService.getProductStoresDatatable(req.body, req.params.storeId, req.user);
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
