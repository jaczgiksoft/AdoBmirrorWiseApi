const sequelize = require('../../config/database');
const occupationRepository = require('./occupation.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class OccupationService {
    // 📋 Listar ocupaciones
    async getAll(tenantUser) {
        if (!tenantUser.tenant_id) throw new Error('No autorizado');
        return occupationRepository.findAllByTenant(tenantUser.tenant_id);
    }

    // 🔍 Obtener una
    async getOne(id, tenantUser) {
        const occupation = await occupationRepository.findById(id, tenantUser.tenant_id);
        if (!occupation) throw new Error('Ocupación no encontrada');
        return occupation;
    }

    // 🟢 Crear ocupación
    async createOccupation(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['name', 'description'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );
            cleanData.tenant_id = currentUser.tenant_id;

            const newOccupation = await occupationRepository.createOccupation(cleanData, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'occupations',
                description: `Nueva ocupación creada: ${newOccupation.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newOccupation;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear ocupación: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar ocupación
    async updateOccupation(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const occupation = await occupationRepository.findById(id, currentUser.tenant_id);
            if (!occupation) throw new Error('Ocupación no encontrada');

            const allowedFields = ['name', 'description'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await occupationRepository.updateOccupation(occupation, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'occupations',
                description: `Ocupación actualizada: ${occupation.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return occupation;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar ocupación: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar ocupación
    async deleteOccupation(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const occupation = await occupationRepository.findById(id, currentUser.tenant_id);
            if (!occupation) throw new Error('Ocupación no encontrada');

            await occupationRepository.deleteOccupation(occupation, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'occupations',
                description: `Ocupación eliminada: ${occupation.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar ocupación: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new OccupationService();
