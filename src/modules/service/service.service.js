const sequelize = require('../../config/database');
const serviceRepository = require('./service.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class ServiceService {
    // 🟢 Crear nuevo servicio
    async createService(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = [
                'name',
                'description',
                'duration_minutes',
                'suggested_units',
                'unit_value',
                'price',
                'requires_inventory',
                'deductible',
                'color',
                'sat_code',
                'cfdi_usage',
            ];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newService = await serviceRepository.createService(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'services',
                description: `Servicio creado: ${newService.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newService;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear servicio: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar servicio existente
    async updateService(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const service = await serviceRepository.findById(id, currentUser.tenant_id);
            if (!service) throw new Error('Servicio no encontrado');

            const allowedFields = [
                'name',
                'description',
                'duration_minutes',
                'suggested_units',
                'unit_value',
                'price',
                'requires_inventory',
                'deductible',
                'color',
                'sat_code',
                'cfdi_usage',
            ];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await serviceRepository.updateService(service, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'services',
                description: `Servicio actualizado: ${service.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return service;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar servicio: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar servicio (borrado lógico)
    async deleteService(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const service = await serviceRepository.findById(id, currentUser.tenant_id);
            if (!service) throw new Error('Servicio no encontrado');

            await serviceRepository.deleteService(service, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'services',
                description: `Servicio eliminado: ${service.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar servicio: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todos los servicios
    async getAllServices(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        return await serviceRepository.findAllByTenant(currentUser.tenant_id);
    }

    // 🔍 Obtener un servicio por ID
    async getServiceById(id, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const service = await serviceRepository.findById(id, currentUser.tenant_id);
        if (!service) throw new Error('Servicio no encontrado');
        return service;
    }
}

module.exports = new ServiceService();
