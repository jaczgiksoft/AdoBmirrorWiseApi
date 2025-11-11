const sequelize = require('../../config/database');
const tenantFeatureRepository = require('./tenantFeature.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper'); // ✅ agregado

class TenantFeatureService {
    // 🧩 Obtener todas las features del tenant
    async getAllFeatures(tenantId) {
        return tenantFeatureRepository.findAllByTenant(tenantId);
    }

    // 🧩 Obtener feature por ID
    async getFeatureById(id, tenantId) {
        const feature = await tenantFeatureRepository.findById(id, tenantId);
        if (!feature) throw new Error('Feature no encontrada');
        return feature;
    }

    // 🟢 Crear nueva feature
    async createFeature(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (await tenantFeatureRepository.findByFeature(currentUser.tenant_id, data.feature)) {
                throw new Error('Esta feature ya existe para el tenant');
            }

            const newFeature = await tenantFeatureRepository.createFeature(
                { ...data, tenant_id: currentUser.tenant_id },
                t
            );

            await t.commit();

            // 🧾 Log administrativo
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'tenant_features',
                description: `Feature creada: ${data.feature}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación interna (solo superadmin / staff)
            await notifyUser({
                user_id: currentUser.id,
                title: 'Nueva feature habilitada',
                message: `${currentUser.username} habilitó la feature "${data.feature}" para el tenant ${currentUser.tenant_id}.`,
                type: 'admin' // notificación interna
            });

            return newFeature;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear feature: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar feature
    async updateFeature(id, data, currentUser, req) {
        const feature = await tenantFeatureRepository.findById(id, currentUser.tenant_id);
        if (!feature) throw new Error('Feature no encontrada');

        await tenantFeatureRepository.updateFeature(feature, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'tenant_features',
            description: `Feature actualizada: ${feature.feature}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación interna
        await notifyUser({
            user_id: currentUser.id,
            title: 'Feature actualizada',
            message: `${currentUser.username} actualizó la feature "${feature.feature}" en el tenant ${currentUser.tenant_id}.`,
            type: 'admin'
        });

        return feature;
    }

    // 🔴 Eliminar feature
    async deleteFeature(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const feature = await tenantFeatureRepository.findById(id, currentUser.tenant_id);
            if (!feature) throw new Error('Feature no encontrada');

            await tenantFeatureRepository.deleteFeature(feature, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'tenant_features',
                description: `Feature eliminada: ${feature.feature}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación interna
            await notifyUser({
                user_id: currentUser.id,
                title: 'Feature eliminada',
                message: `${currentUser.username} eliminó la feature "${feature.feature}" del tenant ${currentUser.tenant_id}.`,
                type: 'admin'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar feature: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getFeaturesDatatable(body, tenantId) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'feature', 'is_enabled', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir };

        const { recordsTotal, recordsFiltered, rows } =
            await tenantFeatureRepository.datatable(params, tenantId);

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data: rows
        };
    }
}

module.exports = new TenantFeatureService();
