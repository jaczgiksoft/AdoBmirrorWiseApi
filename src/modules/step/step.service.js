const sequelize = require('../../config/database');
const stepRepository = require('./step.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class StepService {
    async createStep(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['name', 'description', 'duration_minutes'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newStep = await stepRepository.createStep(cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'steps',
                description: `Paso creado: ${newStep.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newStep;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear paso: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async updateStep(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const step = await stepRepository.findById(id, currentUser.tenant_id);
            if (!step) throw new Error('Paso no encontrado');

            const allowedFields = ['name', 'description', 'duration_minutes'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await stepRepository.updateStep(step, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'steps',
                description: `Paso actualizado: ${step.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return step;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar paso: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async deleteStep(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const step = await stepRepository.findById(id, currentUser.tenant_id);
            if (!step) throw new Error('Paso no encontrado');

            await stepRepository.deleteStep(step, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'steps',
                description: `Paso eliminado: ${step.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar paso: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getAllSteps(currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');
        return await stepRepository.findAllByTenant(currentUser.tenant_id);
    }

    async getStepById(id, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');
        const step = await stepRepository.findById(id, currentUser.tenant_id);
        if (!step) throw new Error('Paso no encontrado');
        return step;
    }

    async getStepsDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'duration_minutes'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir, tenant_id: currentUser.tenant_id };

        const { recordsTotal, recordsFiltered, rows } = await stepRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new StepService();
