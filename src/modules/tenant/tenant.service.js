// src/modules/tenant/tenant.service.js
const sequelize = require('../../config/database');
const tenantRepository = require('./tenant.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class TenantService {
    async getAllTenants(currentUser) {
        if (!currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }
        return tenantRepository.findAll();
    }

    async getTenantById(id) {
        const tenant = await tenantRepository.findById(id);
        if (!tenant) throw new Error('Tenant no encontrado');
        return tenant;
    }

    // 🟢 Crear nuevo tenant
    async createTenant(data, currentUser, req) {
        if (!currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            if (await tenantRepository.findByName(data.name)) {
                throw new Error('Ese nombre ya está en uso');
            }

            // 🔹 Campos permitidos
            const allowedFields = [
                'name', 'description', 'logo_url', 'website',
                'contact_name', 'contact_email', 'contact_phone',
                'address', 'city', 'state', 'country', 'postal_code',
                'tax_id', 'legal_name', 'regime',
                'certificate_path', 'key_path', 'certificate_password',
                'status', 'timezone', 'opening_hours',
                'currency', 'exchange_rate', 'profit_margin'
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.timezone = cleanData.timezone || 'America/Hermosillo';
            cleanData.currency = cleanData.currency || 'MXN';
            cleanData.profit_margin = cleanData.profit_margin ?? 30.0;

            const newTenant = await tenantRepository.createTenant(cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'tenants',
                description: `Tenant creado: ${newTenant.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Nuevo tenant creado',
                message: `${currentUser.username} ha creado la clínica "${newTenant.name}".`,
                type: 'admin'
            });

            return newTenant;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear tenant: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar tenant
    async updateTenant(id, data, currentUser, req) {
        if (!currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const tenant = await tenantRepository.findById(id);
            if (!tenant) throw new Error('Tenant no encontrado');

            if (data.name && data.name !== tenant.name) {
                if (await tenantRepository.findByName(data.name)) {
                    throw new Error('Ese nombre ya está en uso');
                }
            }

            const allowedFields = [
                'description', 'logo_url', 'website',
                'contact_name', 'contact_email', 'contact_phone',
                'address', 'city', 'state', 'country', 'postal_code',
                'tax_id', 'legal_name', 'regime',
                'certificate_path', 'key_path', 'certificate_password',
                'status', 'timezone', 'opening_hours',
                'currency', 'exchange_rate', 'profit_margin'
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await tenantRepository.updateTenant(tenant, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'tenants',
                description: `Tenant actualizado: ${tenant.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Tenant actualizado',
                message: `${currentUser.username} actualizó los datos de la clínica "${tenant.name}".`,
                type: 'admin'
            });

            return tenant;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar tenant: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar tenant
    async deleteTenant(id, currentUser, req) {
        if (!currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const tenant = await tenantRepository.findById(id);
            if (!tenant) throw new Error('Tenant no encontrado');

            await tenantRepository.softDeleteTenant(tenant, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'tenants',
                description: `Tenant eliminado: ${tenant.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Tenant eliminado',
                message: `${currentUser.username} ha eliminado la clínica "${tenant.name}".`,
                type: 'admin'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar tenant: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getTenantSettings(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No se encontró tenant en el token');
        }

        const tenant = await tenantRepository.getSettings(currentUser.tenant_id);
        if (!tenant) throw new Error('Tenant no encontrado');

        return tenant;
    }

    async getTenantsDatatable(body) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'description', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[3][search][value]'] || (body.columns?.[3]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await tenantRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new TenantService();
