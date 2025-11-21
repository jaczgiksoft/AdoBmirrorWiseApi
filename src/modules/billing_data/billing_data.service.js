const sequelize = require('../../config/database');
const billingRepository = require('./billing_data.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class BillingDataService {

    async getAllBilling(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant.');
        }

        return await billingRepository.findAllByTenant(currentUser.tenant_id);
    }

    async getBillingById(id, currentUser) {
        const data = await billingRepository.findById(id, currentUser.tenant_id);
        if (!data) throw new Error('Datos de facturación no encontrados');
        return data;
    }

    async createBilling(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const allowed = [
                'tenant_id', 'business_name', 'rfc', 'tax_regime',
                'zip_code', 'email', 'is_active'
            ];

            const clean = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowed.includes(key))
            );

            clean.tenant_id = currentUser.tenant_id;

            const created = await billingRepository.createBillingData(clean, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'billing_data',
                description: `Datos fiscales creados: ${clean.business_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Nuevo dato fiscal',
                message: `Se agregó ${clean.business_name} como dato fiscal`,
                type: 'info'
            });

            return created;

        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear billing_data: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async updateBilling(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const billing = await billingRepository.findById(id, currentUser.tenant_id);
            if (!billing) throw new Error('Datos de facturación no encontrados');

            const allowed = [
                'business_name', 'rfc', 'tax_regime',
                'zip_code', 'email', 'is_active'
            ];

            const clean = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowed.includes(key))
            );

            await billingRepository.updateBillingData(billing, clean, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'billing_data',
                description: `Actualizado dato fiscal: ${billing.business_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return billing;

        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }

    async deleteBilling(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const billing = await billingRepository.findById(id, currentUser.tenant_id);
            if (!billing) throw new Error('Dato fiscal no encontrado');

            await billingRepository.softDeleteBillingData(billing, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'billing_data',
                description: `Dato fiscal eliminado: ${billing.business_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;

        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new BillingDataService();
