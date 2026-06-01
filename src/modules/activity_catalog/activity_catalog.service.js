const sequelize = require('../../config/database');
const activityCatalogRepository = require('./activity_catalog.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class ActivityCatalogService {
    async create(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['name', 'is_custom', 'is_active'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newActivity = await activityCatalogRepository.create(cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'activity_catalogs',
                description: `Actividad creada: ${newActivity.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return newActivity;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear actividad: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async update(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const activity = await activityCatalogRepository.findById(id, currentUser.tenant_id);
            if (!activity) throw new Error('Actividad no encontrada');

            const allowedFields = ['name', 'is_active'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await activityCatalogRepository.update(activity, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'activity_catalogs',
                description: `Actividad actualizada: ${activity.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return activity;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar actividad: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async delete(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const activity = await activityCatalogRepository.findById(id, currentUser.tenant_id);
            if (!activity) throw new Error('Actividad no encontrada');

            await activityCatalogRepository.delete(activity, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'activity_catalogs',
                description: `Actividad eliminada: ${activity.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar actividad: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getAll(currentUser, queryParams = {}) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const { search, include_inactive } = queryParams;

        return activityCatalogRepository.findAllByTenant(currentUser.tenant_id, {
            search,
            includeInactive: include_inactive === 'true',
        });
    }

    async getById(id, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const activity = await activityCatalogRepository.findById(id, currentUser.tenant_id);
        if (!activity) throw new Error('Actividad no encontrada');
        return activity;
    }
}

module.exports = new ActivityCatalogService();
