const providerService = require('./inventory_provider.service');

const getAll = async (req, res) => {
    try {
        const providers = await providerService.getAllProviders(req.user);
        res.json(providers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const provider = await providerService.getProviderById(req.params.id, req.user);
        res.json(provider);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const provider = await providerService.createProvider(req.body, req.user);
        res.status(201).json({ message: 'Proveedor creado', provider });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const provider = await providerService.updateProvider(req.params.id, req.body, req.user);
        res.json({ message: 'Proveedor actualizado', provider });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const softDelete = async (req, res) => {
    try {
        await providerService.deleteProvider(req.params.id, req.user);
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, softDelete };
