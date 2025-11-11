// src/modules/unit/unit.repository.js
const Unit = require('../../models/mysql/unit.model');
const { Op } = require('sequelize');

class UnitRepository {
    async findAll() {
        return Unit.findAll({ order: [['name', 'ASC']] });
    }

    async findById(id) {
        return Unit.findByPk(id);
    }

    async findByName(name) {
        return Unit.findOne({ where: { name } });
    }

    async findBySymbol(symbol) {
        return Unit.findOne({ where: { symbol } });
    }

    async createUnit(data, transaction) {
        return Unit.create(data, { transaction });
    }

    async updateUnit(unit, data) {
        return unit.update(data);
    }

    async softDeleteUnit(unit, transaction) {
        unit.status = 'inactive';
        await unit.save({ transaction });
        await unit.destroy({ transaction }); // paranoid
    }

    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { symbol: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = andConditions.length ? { [Op.and]: andConditions } : {};

        const recordsTotal = await Unit.count();

        const { rows, count: recordsFiltered } = await Unit.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new UnitRepository();
