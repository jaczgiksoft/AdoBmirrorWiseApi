// src/modules/supplier/supplier.controller.js
const supplierService = require('./supplier.service');

/**
 * Controlador de Proveedores
 */
const getAll = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers(req.user);
        res.json(suppliers);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(req.params.id, req.user);
        res.json(supplier);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const supplier = await supplierService.createSupplier(req.body, req.user, req);
        res.status(201).json({ message: 'Proveedor creado correctamente', supplier });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const supplier = await supplierService.updateSupplier(req.params.id, req.body, req.user, req);
        res.json({ message: 'Proveedor actualizado correctamente', supplier });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await supplierService.deleteSupplier(req.params.id, req.user, req);
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDatatable = async (req, res) => {
    try {
        const result = await supplierService.getSuppliersDatatable(req.body, req.user);
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
