// src/modules/category/category.repository.js
const Category = require('../../models/mysql/category.model');
const { Op } = require('sequelize');

class CategoryRepository {
    async findAll() {
        return Category.findAll({ order: [['name', 'ASC']] });
    }

    async findById(id) {
        return Category.findByPk(id);
    }

    async findByName(name) {
        return Category.findOne({ where: { name } });
    }

    async createCategory(data, transaction) {
        return Category.create(data, { transaction });
    }

    async updateCategory(category, data) {
        return category.update(data);
    }

    async softDeleteCategory(category, transaction) {
        category.status = 'inactive';
        await category.save({ transaction });
        await category.destroy({ transaction }); // paranoid
    }

    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = andConditions.length ? { [Op.and]: andConditions } : {};

        const recordsTotal = await Category.count();

        const { rows, count: recordsFiltered } = await Category.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new CategoryRepository();
