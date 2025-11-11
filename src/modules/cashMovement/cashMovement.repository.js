const { Op, fn, literal } = require('sequelize');
const CashMovement = require('../../models/mysql/cashMovement.model');

class CashMovementRepository {
    async createMovement(data, transaction) {
        return CashMovement.create(data, { transaction });
    }

    async findById(id, tenantId) {
        return CashMovement.findOne({
            where: { id, tenant_id: tenantId }
        });
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, typeFilter } = params;

        const andConditions = [{ tenant_id: tenantId }];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { concept: { [Op.like]: `%${searchValue}%` } },
                    { notes: { [Op.like]: `%${searchValue}%` } },
                    { type: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (typeFilter && typeFilter.trim() !== '') {
            andConditions.push({ type: typeFilter.trim() });
        }

        const where = { [Op.and]: andConditions };

        const recordsTotal = await CashMovement.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await CashMovement.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }

    // 🔹 Nuevo método: obtener saldo de la sesión
    async getSessionBalance(sessionId, tenantId, transaction) {
        const result = await CashMovement.findOne({
            attributes: [
                [
                    fn(
                        'COALESCE',
                        fn('SUM', literal(`CASE WHEN type = 'inflow' THEN amount END`)),
                        0
                    ),
                    'inflows'
                ],
                [
                    fn(
                        'COALESCE',
                        fn('SUM', literal(`CASE WHEN type = 'outflow' THEN amount END`)),
                        0
                    ),
                    'outflows'
                ]
            ],
            where: {
                cash_session_id: sessionId,
                tenant_id: tenantId,
                deleted_at: null
            },
            transaction,
            raw: true
        });

        const inflows = parseFloat(result.inflows || 0);
        const outflows = parseFloat(result.outflows || 0);
        return inflows - outflows;
    }
}

module.exports = new CashMovementRepository();
