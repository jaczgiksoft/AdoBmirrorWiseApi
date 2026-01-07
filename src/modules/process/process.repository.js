const { Op } = require('sequelize');
const Process = require('../../models/mysql/process.model');
const ProcessStep = require('../../models/mysql/process_step.model');
const Step = require('../../models/mysql/step.model');

class ProcessRepository {
    async createProcess(data, transaction) {
        return Process.create(data, { transaction });
    }

    async updateProcess(process, data, transaction) {
        return process.update(data, { transaction });
    }

    async deleteProcess(process, transaction) {
        return process.destroy({ transaction });
    }

    // ProcessStep Management
    async createProcessSteps(stepsData, transaction) {
        return ProcessStep.bulkCreate(stepsData, { transaction });
    }

    async deleteProcessStepsByProcessId(processId, transaction) {
        return ProcessStep.destroy({
            where: { process_id: processId },
            transaction
        });
    }

    // Finders
    async findById(id, tenantId) {
        return Process.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                {
                    model: ProcessStep,
                    as: 'process_steps',
                    include: [{ model: Step, as: 'step' }]
                }
            ],
            order: [[{ model: ProcessStep, as: 'process_steps' }, 'order_index', 'ASC']]
        });
    }

    async findAllByTenant(tenantId) {
        return Process.findAll({
            where: { tenant_id: tenantId },
            include: [
                {
                    model: ProcessStep,
                    as: 'process_steps',
                    include: [{ model: Step, as: 'step' }]
                }
            ],
            order: [['name', 'ASC'], [{ model: ProcessStep, as: 'process_steps' }, 'order_index', 'ASC']]
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

        const recordsTotal = await Process.count({ where: { tenant_id } });

        const defaultOrder = [["id", "DESC"]];
        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await Process.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: finalOrder,
            // Include steps for display if needed, but for datatable maybe overkill? 
            // Better to fetch details on demand. Keeping light.
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new ProcessRepository();
