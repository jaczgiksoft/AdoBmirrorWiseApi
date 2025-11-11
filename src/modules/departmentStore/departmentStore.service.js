// src/modules/departmentStore/departmentStore.service.js
const sequelize = require('../../config/database');
const departmentStoreRepository = require('./departmentStore.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class DepartmentStoreService {
    async setOverride(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (data.use_parent_profit_margin === false && (data.profit_margin_override == null)) {
                throw new Error(
                    'Debes especificar un margen si no se usa el margen del nivel superior.'
                );
            }

            const payload = {
                department_id: data.department_id,
                store_id: data.store_id,
                profit_margin_override: data.use_parent_profit_margin
                    ? null
                    : data.profit_margin_override,
                use_parent_profit_margin: data.use_parent_profit_margin ?? true,
            };

            const record = await departmentStoreRepository.createOrUpdate(payload, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'departmentStores',
                description: `Margen de ganancia actualizado en tienda #${data.store_id} para departamento #${data.department_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return record;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al guardar DepartmentStore: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getOverridesByStore(storeId) {
        return departmentStoreRepository.findAllByStore(storeId);
    }

    async deleteOverride(departmentId, storeId, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const deleted = await departmentStoreRepository.delete(departmentId, storeId, t);
            await t.commit();

            if (!deleted) throw new Error('Relación departamento-tienda no encontrada');

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'departmentStores',
                description: `Override eliminado para depto #${departmentId} en tienda #${storeId}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar DepartmentStore: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new DepartmentStoreService();
