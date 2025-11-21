const sequelize = require('../../config/database');
const referralRepository = require('./referral.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class ReferralService {
    // 📋 Listar referidores
    async getAll(tenantUser) {
        if (!tenantUser.tenant_id) throw new Error('No autorizado');
        return referralRepository.findAllByTenant(tenantUser.tenant_id);
    }

    // 🔍 Obtener uno
    async getOne(id, tenantUser) {
        const referral = await referralRepository.findById(id, tenantUser.tenant_id);
        if (!referral) throw new Error('Referidor no encontrado');
        return referral;
    }

    // 🟢 Crear referidor
    async createReferral(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['name', 'contact_name', 'contact_phone', 'contact_email', 'notes'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );
            cleanData.tenant_id = currentUser.tenant_id;

            const newReferral = await referralRepository.createReferral(cleanData, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'referrals',
                description: `Nuevo referidor creado: ${newReferral.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newReferral;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear referidor: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar referidor
    async updateReferral(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const referral = await referralRepository.findById(id, currentUser.tenant_id);
            if (!referral) throw new Error('Referidor no encontrado');

            const allowedFields = ['name', 'contact_name', 'contact_phone', 'contact_email', 'notes'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await referralRepository.updateReferral(referral, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'referrals',
                description: `Referidor actualizado: ${referral.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return referral;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar referidor: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar referidor
    async deleteReferral(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const referral = await referralRepository.findById(id, currentUser.tenant_id);
            if (!referral) throw new Error('Referidor no encontrado');

            await referralRepository.deleteReferral(referral, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'referrals',
                description: `Referidor eliminado: ${referral.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar referidor: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new ReferralService();
