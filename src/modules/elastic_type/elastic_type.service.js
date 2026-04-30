const sequelize = require('../../config/database');
const elasticTypeRepository = require('./elastic_type.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class ElasticTypeService {
    async getAll(currentUser) {
        const { tenant_id } = currentUser;
        return elasticTypeRepository.findAll(tenant_id);
    }

    async getById(id, currentUser) {
        const { tenant_id } = currentUser;
        const elasticType = await elasticTypeRepository.findById(id, tenant_id);
        if (!elasticType) throw new Error('Tipo de elástico no encontrado');
        return elasticType;
    }

    async create(data, currentUser, req) {
        const { tenant_id, id: user_id, username } = currentUser;
        const t = await sequelize.transaction();

        try {
            const payload = {
                tenant_id,
                name: data.name.trim(),
                color: data.color || '#CCCCCC',
                type: data.type || null,
                size: data.size,
                oz: data.oz,
            };

            const elasticType = await elasticTypeRepository.createElasticType(payload, t);
            await t.commit();

            await createLog({
                user_id,
                user_name: username,
                action: 'create',
                module: 'elastic_types',
                description: `Creó el tipo de elástico "${elasticType.name}" (${elasticType.size}, ${elasticType.oz})`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            await notifyUser({
                user_id,
                title: 'Nuevo tipo de elástico',
                message: `${username} ha creado el tipo "${elasticType.name}"`,
                type: 'info',
            });

            return elasticType;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear tipo de elástico: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async update(id, data, currentUser, req) {
        const { tenant_id, id: user_id, username } = currentUser;
        const t = await sequelize.transaction();

        try {
            const elasticType = await elasticTypeRepository.findById(id, tenant_id);
            if (!elasticType) throw new Error('Tipo de elástico no encontrado');

            const payload = {
                name: data.name?.trim() ?? elasticType.name,
                color: data.color ?? elasticType.color,
                type: data.type ?? elasticType.type,
                size: data.size ?? elasticType.size,
                oz: data.oz ?? elasticType.oz,
            };

            await elasticTypeRepository.updateElasticType(elasticType, payload, t);
            await t.commit();

            await createLog({
                user_id,
                user_name: username,
                action: 'update',
                module: 'elastic_types',
                description: `Actualizó el tipo de elástico "${elasticType.name}"`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return elasticType;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar tipo de elástico: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async delete(id, currentUser, req) {
        const { tenant_id, id: user_id, username } = currentUser;
        const t = await sequelize.transaction();

        try {
            const elasticType = await elasticTypeRepository.findById(id, tenant_id);
            if (!elasticType) throw new Error('Tipo de elástico no encontrado');

            await elasticTypeRepository.softDeleteElasticType(elasticType, t);
            await t.commit();

            await createLog({
                user_id,
                user_name: username,
                action: 'delete',
                module: 'elastic_types',
                description: `Eliminó el tipo de elástico "${elasticType.name}"`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar tipo de elástico: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getDatatable(body, currentUser) {
        const { tenant_id } = currentUser;

        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 1);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'type', 'size', 'oz', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir };

        const { recordsTotal, recordsFiltered, rows } =
            await elasticTypeRepository.datatable(params, tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new ElasticTypeService();
