// src/modules/user/user.repository.js
const { Op } = require('sequelize');
const User = require('../../models/mysql/user.model');
const Role = require('../../models/mysql/role.model');
const Tenant = require('../../models/mysql/tenant.model');
const Employee = require('../../models/mysql/employee.model');

class UserRepository {
    async findAllByTenant(tenantId) {
        return User.findAll({
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                {
                    model: Employee,
                    as: 'employee',
                    where: { tenant_id: tenantId }
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findById(id, tenantId) {
        return User.findOne({
            where: { id },
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                {
                    model: Employee,
                    as: 'employee',
                    where: { tenant_id: tenantId }
                }
            ]
        });
    }

    async findByUsername(username, tenantId) {
        return User.findOne({
            where: { username },
            include: [{ model: Employee, as: 'employee', where: { tenant_id: tenantId } }]
        });
    }



    async createUser(data, transaction) {
        return User.create(data, { transaction });
    }

    async updateUser(user, data) {
        return user.update(data);
    }

    async softDeleteUser(user, transaction) {
        // 🔹 Solo inactiva y usa paranoid delete
        user.status = 'inactive';
        await user.save({ transaction });
        await user.destroy({ transaction }); // paranoid -> marca deletedAt
    }

    async incrementTenantUsers(tenantId, transaction) {
        return Tenant.increment('current_users', { by: 1, where: { id: tenantId }, transaction });
    }

    async decrementTenantUsers(tenantId, transaction) {
        return Tenant.decrement('current_users', { by: 1, where: { id: tenantId }, transaction });
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { username: { [Op.like]: `%${searchValue}%` } },
                    { '$employee.email$': { [Op.like]: `%${searchValue}%` } },
                    { '$employee.first_name$': { [Op.like]: `%${searchValue}%` } },
                    { '$employee.last_name$': { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = { [Op.and]: andConditions };

        // Orden dinámico
        let order = [];
        if (orderColumn === 'role.name') {
            order = [[{ model: Role, as: 'role' }, 'name', orderDir]];
        } else {
            order = [[orderColumn, orderDir]];
        }

        const recordsTotal = await User.count({
            include: [{ model: Employee, as: 'employee', where: { tenant_id: tenantId } }]
        });

        const { rows, count: recordsFiltered } = await User.findAndCountAll({
            where,
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                {
                    model: Employee,
                    as: 'employee',
                    where: { tenant_id: tenantId },
                    include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'name'] }]
                }
            ],
            subQuery: false, // 💡 Important for cross-table OR search
            offset: start,
            limit: length,
            order
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new UserRepository();
