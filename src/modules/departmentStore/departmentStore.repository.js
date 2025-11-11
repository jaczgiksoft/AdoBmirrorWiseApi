// src/modules/departmentStore/departmentStore.repository.js
const DepartmentStore = require('../../models/mysql/departmentStore.model');
const { Op } = require('sequelize');

class DepartmentStoreRepository {
    async findByDepartmentAndStore(departmentId, storeId) {
        return DepartmentStore.findOne({
            where: { department_id: departmentId, store_id: storeId },
        });
    }

    async findAllByStore(storeId) {
        return DepartmentStore.findAll({
            where: { store_id: storeId },
            order: [['created_at', 'DESC']],
        });
    }

    async createOrUpdate(data, transaction) {
        const existing = await this.findByDepartmentAndStore(data.department_id, data.store_id);
        if (existing) {
            await existing.update(data, { transaction });
            return existing;
        }
        return DepartmentStore.create(data, { transaction });
    }

    async delete(departmentId, storeId, transaction) {
        const record = await this.findByDepartmentAndStore(departmentId, storeId);
        if (!record) return false;
        await record.destroy({ transaction });
        return true;
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir } = params;

        const where = {};

        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { '$Department.name$': { [Op.like]: `%${searchValue}%` } },
                { '$Store.name$': { [Op.like]: `%${searchValue}%` } },
            ];
        }

        const { rows, count } = await DepartmentStore.findAndCountAll({
            where,
            include: [
                { association: 'department', attributes: ['id', 'name'] },
                { association: 'store', attributes: ['id', 'name'] },
            ],
            offset: start,
            limit: length,
            order: [[orderColumn || 'id', orderDir || 'ASC']],
        });

        return { recordsTotal: count, recordsFiltered: count, rows };
    }
}

module.exports = new DepartmentStoreRepository();
