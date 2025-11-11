// src/modules/inventoryMovement/inventoryMovement.repository.js
const InventoryMovement = require('../../models/mysql/inventoryMovement.model');
const { Op } = require('sequelize');

class InventoryMovementRepository {
    async createMovement(data, transaction) {
        return InventoryMovement.create(data, { transaction });
    }

    async findById(id, tenantId) {
        return InventoryMovement.findOne({ where: { id, tenant_id: tenantId } });
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, storeId, productId } = params;

        const andConditions = [{ tenant_id: tenantId }];

        if (storeId) andConditions.push({ store_id: storeId });
        if (productId) andConditions.push({ product_id: productId });

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { type: { [Op.like]: `%${searchValue}%` } },
                    { reason: { [Op.like]: `%${searchValue}%` } },
                    { notes: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        const where = { [Op.and]: andConditions };

        const recordsTotal = await InventoryMovement.count({ where: { tenant_id: tenantId } });
        const { rows, count: recordsFiltered } = await InventoryMovement.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new InventoryMovementRepository();
