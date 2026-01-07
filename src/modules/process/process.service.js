const sequelize = require('../../config/database');
const processRepository = require('./process.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class ProcessService {
    async createProcess(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            // 1. Create Process
            const processData = {
                name: data.name,
                description: data.description,
                tenant_id: currentUser.tenant_id
            };
            const newProcess = await processRepository.createProcess(processData, t);

            // 2. Create Process Steps (if any)
            if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
                const processStepsData = data.steps.map((s, index) => ({
                    process_id: newProcess.id,
                    step_id: s.step_id,
                    order_index: index, // Ensure order matches array index
                    duration_override: s.duration_override || null
                }));
                await processRepository.createProcessSteps(processStepsData, t);
            }

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'processes',
                description: `Proceso creado: ${newProcess.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // Return full object with steps
            return await processRepository.findById(newProcess.id, currentUser.tenant_id);
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear proceso: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async updateProcess(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const process = await processRepository.findById(id, currentUser.tenant_id);
            if (!process) throw new Error('Proceso no encontrado');

            // 1. Update Process Base
            await processRepository.updateProcess(process, {
                name: data.name,
                description: data.description
            }, t);

            // 2. Sync Steps (Delete All + Recreate Strategy)
            if (data.steps && Array.isArray(data.steps)) {
                await processRepository.deleteProcessStepsByProcessId(id, t);

                if (data.steps.length > 0) {
                    const processStepsData = data.steps.map((s, index) => ({
                        process_id: id,
                        step_id: s.step_id,
                        order_index: index,
                        duration_override: s.duration_override || null
                    }));
                    await processRepository.createProcessSteps(processStepsData, t);
                }
            }

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'processes',
                description: `Proceso actualizado: ${process.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return await processRepository.findById(id, currentUser.tenant_id);
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar proceso: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async deleteProcess(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const process = await processRepository.findById(id, currentUser.tenant_id);
            if (!process) throw new Error('Proceso no encontrado');

            await processRepository.deleteProcess(process, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'processes',
                description: `Proceso eliminado: ${process.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar proceso: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getAllProcesses(currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');
        return await processRepository.findAllByTenant(currentUser.tenant_id);
    }

    async getProcessById(id, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');
        const process = await processRepository.findById(id, currentUser.tenant_id);
        if (!process) throw new Error('Proceso no encontrado');
        return process;
    }

    async getProcessesDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'description'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir, tenant_id: currentUser.tenant_id };

        const { recordsTotal, recordsFiltered, rows } = await processRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new ProcessService();
