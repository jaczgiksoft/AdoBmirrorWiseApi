// src/modules/positions/position.repository.js
const Position = require('../../models/mysql/position.model');
const { Op } = require('sequelize');

class PositionRepository {
    async findAllByTenant(tenantId) {
        return Position.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return Position.findOne({ where: { id, tenant_id: tenantId } });
    }

    async findByName(name, tenantId) {
        return Position.findOne({ where: { name, tenant_id: tenantId } });
    }

    async createPosition(data, transaction) {
        return Position.create(data, { transaction });
    }

    async updatePosition(position, data) {
        return position.update(data);
    }

    async softDeletePosition(position, transaction) {
        position.status = 'inactive';
        await position.save({ transaction });
        await position.destroy({ transaction }); // paranoid → marca deletedAt
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir } = params;

        const andConditions = [{ tenant_id: tenantId }];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { description: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        const where = { [Op.and]: andConditions };

        const recordsTotal = await Position.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await Position.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new PositionRepository();
