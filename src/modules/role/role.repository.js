// src/modules/role/role.repository.js
const Role = require('../../models/mysql/role.model');
const Permission = require('../../models/mysql/permission.model');
const { Op } = require('sequelize');

class RoleRepository {
    async findAllByTenant(tenantId) {
        return Role.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return Role.findOne({
            where: { id, tenant_id: tenantId },
            include: [{ model: Permission, as: 'permissions' }]
        });
    }

    async findByName(name, tenantId) {
        return Role.findOne({ where: { name, tenant_id: tenantId } });
    }

    async createRole(data, transaction) {
        return Role.create(data, { transaction });
    }

    async updateRole(role, data) {
        return role.update(data);
    }

    async softDeleteRole(role, transaction) {
        role.status = 'inactive';
        await role.save({ transaction });
        await role.destroy({ transaction }); // paranoid → marca deletedAt
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir } = params;

        const andConditions = [{ tenant_id: tenantId }];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({ name: { [Op.like]: `%${searchValue}%` } });
        }

        const where = { [Op.and]: andConditions };

        const recordsTotal = await Role.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await Role.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }

}

module.exports = new RoleRepository();
