// src/modules/brand/brand.repository.js
const Brand = require('../../models/mysql/brand.model');
const { Op } = require('sequelize');

class BrandRepository {
    async findAll(tenantId) {
        return Brand.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return Brand.findOne({ where: { id, tenant_id: tenantId } });
    }

    async findByName(name, tenantId) {
        return Brand.findOne({ where: { name, tenant_id: tenantId } });
    }

    async createBrand(data, transaction) {
        return Brand.create(data, { transaction });
    }

    async updateBrand(brand, data) {
        return brand.update(data);
    }

    async softDeleteBrand(brand, transaction) {
        brand.status = 'inactive';
        await brand.save({ transaction });
        await brand.destroy({ transaction }); // paranoid
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [{ tenant_id: tenantId }];

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

        const where = { [Op.and]: andConditions };

        const recordsTotal = await Brand.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await Brand.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new BrandRepository();
