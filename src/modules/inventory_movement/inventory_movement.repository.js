const InventoryMovement = require('../../models/mysql/inventory_movement.model');
const InventoryItem = require('../../models/mysql/inventory_item.model');
const InventoryProvider = require('../../models/mysql/inventory_provider.model');
const sequelize = require('../../config/database');

const create = async (data, t = null) => {
    return await InventoryMovement.create(data, { transaction: t });
};

const findAll = async (tenant_id) => {
    return await InventoryMovement.findAll({ 
        where: { tenant_id },
        include: [
            { model: InventoryItem, as: 'item', attributes: ['name', 'sku'] },
            { model: InventoryProvider, as: 'provider', attributes: ['name'] }
        ],
        order: [['date', 'DESC']]
    });
};

module.exports = {
    create,
    findAll
};
