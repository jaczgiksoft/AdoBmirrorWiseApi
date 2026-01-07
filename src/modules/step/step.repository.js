const { Op } = require('sequelize');
const Step = require('../../models/mysql/step.model');

class StepRepository {
    async createStep(data, transaction) {
        return Step.create(data, { transaction });
    }

    async updateStep(step, data, transaction) {
        return step.update(data, { transaction });
    }

    async deleteStep(step, transaction) {
        return step.destroy({ transaction });
    }

    async findById(id, tenantId) {
        return Step.findOne({
            where: { id, tenant_id: tenantId },
        });
    }

    async findAllByTenant(tenantId) {
        return Step.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }

    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, tenant_id } = params;

        const where = { tenant_id };

        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { name: { [Op.like]: `%${searchValue}%` } },
                { description: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const recordsTotal = await Step.count({ where: { tenant_id } });

        const defaultOrder = [["id", "DESC"]];
        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await Step.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: finalOrder,
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new StepRepository();
