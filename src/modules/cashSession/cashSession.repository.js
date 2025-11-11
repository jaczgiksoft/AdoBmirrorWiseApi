// src/modules/cashSession/cashSession.repository.js
const CashSession = require('../../models/mysql/cashSession.model');
const { Op } = require('sequelize');

class CashSessionRepository {
    async findById(id, tenantId) {
        return CashSession.findOne({ where: { id, tenant_id: tenantId } });
    }

    async findOpenByRegister(cashRegisterId, tenantId) {
        return CashSession.findOne({
            where: {
                tenant_id: tenantId,
                cash_register_id: cashRegisterId,
                status: 'open'
            }
        });
    }

    async createSession(data, transaction) {
        return CashSession.create(data, { transaction });
    }

    async closeSession(session, data, transaction) {
        return session.update(data, { transaction });
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [{ tenant_id: tenantId }];

        if (searchValue) {
            andConditions.push({
                [Op.or]: [
                    { notes: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (statusFilter) {
            andConditions.push({ status: statusFilter });
        }

        const where = { [Op.and]: andConditions };

        const recordsTotal = await CashSession.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await CashSession.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new CashSessionRepository();
