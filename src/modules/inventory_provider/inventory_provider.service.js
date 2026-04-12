const providerRepo = require('./inventory_provider.repository');

const createProvider = async (data, user) => {
    const providerData = { ...data, tenant_id: user.tenant_id };
    return await providerRepo.create(providerData);
};

const getProviderById = async (id, user) => {
    const provider = await providerRepo.findById(id, user.tenant_id);
    if (!provider) throw new Error('Proveedor no encontrado');
    return provider;
};

const getAllProviders = async (user) => {
    return await providerRepo.findAll(user.tenant_id);
};

const updateProvider = async (id, data, user) => {
    return await providerRepo.update(id, user.tenant_id, data);
};

const deleteProvider = async (id, user) => {
    return await providerRepo.softDelete(id, user.tenant_id);
};

module.exports = {
    createProvider,
    getProviderById,
    getAllProviders,
    updateProvider,
    deleteProvider
};
