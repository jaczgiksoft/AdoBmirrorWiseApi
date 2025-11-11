// src/modules/tax/tax.repository.js
const Tax = require('../../models/mysql/tax.model');
const { Op } = require('sequelize');

class TaxRepository {
    async findAll() {
        return Tax.findAll({ order: [['name', 'ASC']] });
    }

    async findById(id) {
        return Tax.findByPk(id);
    }

    async findByName(name) {
        return Tax.findOne({ where: { name } });
    }

    async createTax(data, transaction) {
        return Tax.create(data, { transaction });
    }

    async updateTax(tax, data) {
        return tax.update(data);
    }

    async softDeleteTax(tax, transaction) {
        tax.status = 'inactive';
        await tax.save({ transaction });
        await tax.destroy({ transaction }); // paranoid
    }

    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { rate: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = andConditions.length ? { [Op.and]: andConditions } : {};

        const recordsTotal = await Tax.count();

        const { rows, count: recordsFiltered } = await Tax.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new TaxRepository();
