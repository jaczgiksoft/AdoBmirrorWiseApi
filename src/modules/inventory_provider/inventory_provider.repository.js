const InventoryProvider = require('../../models/mysql/inventory_provider.model');

const create = async (data) => {
    return await InventoryProvider.create(data);
};

const findById = async (id, tenant_id) => {
    return await InventoryProvider.findOne({ where: { id, tenant_id } });
};

const findAll = async (tenant_id) => {
    return await InventoryProvider.findAll({ where: { tenant_id } });
};

const update = async (id, tenant_id, data) => {
    const provider = await findById(id, tenant_id);
    if (!provider) throw new Error('Proveedor no encontrado');
    return await provider.update(data);
};

const softDelete = async (id, tenant_id) => {
    const provider = await findById(id, tenant_id);
    if (!provider) throw new Error('Proveedor no encontrado');
    return await provider.destroy();
};

module.exports = {
    create,
    findById,
    findAll,
    update,
    softDelete
};
