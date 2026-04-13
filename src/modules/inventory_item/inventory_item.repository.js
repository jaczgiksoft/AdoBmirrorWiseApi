const InventoryItem = require('../../models/mysql/inventory_item.model');
const InventoryProvider = require('../../models/mysql/inventory_provider.model');

const create = async (data) => {
    return await InventoryItem.create(data);
};

const findById = async (id, tenant_id) => {
    return await InventoryItem.findOne({ 
        where: { id, tenant_id },
        include: [{ model: InventoryProvider, as: 'provider' }]
    });
};

const findAll = async (tenant_id) => {
    return await InventoryItem.findAll({ 
        where: { tenant_id },
        include: [{ model: InventoryProvider, as: 'provider' }]
    });
};

const update = async (id, tenant_id, data) => {
    const item = await findById(id, tenant_id);
    if (!item) throw new Error('Artículo no encontrado');
    return await item.update(data);
};

const updateStock = async (id, tenant_id, newStock, t = null) => {
    const item = await findById(id, tenant_id);
    if (!item) throw new Error('Artículo no encontrado');
    return await item.update({ current_stock: newStock }, { transaction: t });
};

const softDelete = async (id, tenant_id) => {
    const item = await findById(id, tenant_id);
    if (!item) throw new Error('Artículo no encontrado');
    return await item.destroy();
};

module.exports = {
    create,
    findById,
    findAll,
    update,
    updateStock,
    softDelete
};
