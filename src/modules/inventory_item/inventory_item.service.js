const itemRepo = require('./inventory_item.repository');

const createItem = async (data, user) => {
    const itemData = { ...data, tenant_id: user.tenant_id };
    return await itemRepo.create(itemData);
};

const getItemById = async (id, user) => {
    const item = await itemRepo.findById(id, user.tenant_id);
    if (!item) throw new Error('Artículo no encontrado');
    return item;
};

const getAllItems = async (user) => {
    return await itemRepo.findAll(user.tenant_id);
};

const updateItem = async (id, data, user) => {
    return await itemRepo.update(id, user.tenant_id, data);
};

const deleteItem = async (id, user) => {
    return await itemRepo.softDelete(id, user.tenant_id);
};

module.exports = {
    createItem,
    getItemById,
    getAllItems,
    updateItem,
    deleteItem
};
