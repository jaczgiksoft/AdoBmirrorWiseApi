// src/modules/departmentStore/departmentStore.controller.js
const departmentStoreService = require('./departmentStore.service');

const setOverride = async (req, res) => {
    try {
        const record = await departmentStoreService.setOverride(req.body, req.user, req);
        res.status(200).json({ message: 'Configuración de margen actualizada', record });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getByStore = async (req, res) => {
    try {
        const list = await departmentStoreService.getOverridesByStore(req.params.storeId);
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteOverride = async (req, res) => {
    try {
        await departmentStoreService.deleteOverride(
            req.params.departmentId,
            req.params.storeId,
            req.user,
            req
        );
        res.json({ message: 'Override eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { setOverride, getByStore, deleteOverride };
