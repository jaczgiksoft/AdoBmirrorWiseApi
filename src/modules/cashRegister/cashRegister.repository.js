// src/modules/cashRegister/cashRegister.repository.js
const CashRegister = require('../../models/mysql/cashRegister.model');
const { Op } = require('sequelize');

class CashRegisterRepository {
    async findAllByTenant(tenantId) {
        return CashRegister.findAll({ where: { tenant_id: tenantId }, order: [['id', 'ASC']] });
    }

    async findById(id, tenantId) {
        return CashRegister.findOne({ where: { id, tenant_id: tenantId } });
    }

    // 🔍 Buscar caja por código (pcName)
    async findByCode(code, tenantId) {
        return CashRegister.findOne({
            where: { code, tenant_id: tenantId },
        });
    }

    async create(data, transaction) {
        return CashRegister.create(data, { transaction });
    }

    async update(cashRegister, data) {
        return cashRegister.update(data);
    }

    async softDelete(cashRegister, transaction) {
        cashRegister.status = 'inactive';
        await cashRegister.save({ transaction });
        await cashRegister.destroy({ transaction }); // paranoid
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [{ tenant_id: tenantId }];

        // 🔍 Búsqueda general
        if (searchValue && searchValue.trim() !== "") {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue.trim()}%` } },
                    { code: { [Op.like]: `%${searchValue.trim()}%` } },
                    { status: { [Op.like]: `%${searchValue.trim()}%` } },
                ],
            });
        }

        // 🔹 Filtro de estado
        if (statusFilter && statusFilter.trim() !== "") {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = { [Op.and]: andConditions };

        // 🔢 Conteo total y filtrado
        const recordsTotal = await CashRegister.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await CashRegister.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
        });

        return { recordsTotal, recordsFiltered, rows };
    }

}

module.exports = new CashRegisterRepository();
