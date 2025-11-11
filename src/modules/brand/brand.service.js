// src/modules/brand/brand.service.js
const sequelize = require('../../config/database');
const brandRepository = require('./brand.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class BrandService {
    async getAllBrands(currentUser) {
        return brandRepository.findAll(currentUser.tenant_id);
    }

    async getBrandById(id, currentUser) {
        const brand = await brandRepository.findById(id, currentUser.tenant_id);
        if (!brand) throw new Error('Marca no encontrada');
        return brand;
    }

    // 🟢 Crear marca
    async createBrand(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (await brandRepository.findByName(data.name, currentUser.tenant_id)) {
                throw new Error('El nombre de la marca ya está en uso');
            }

            const newBrand = await brandRepository.createBrand({
                ...data,
                tenant_id: currentUser.tenant_id
            }, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'brands',
                description: `Marca creada: ${newBrand.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nueva marca creada',
                message: `Se ha creado la marca ${newBrand.name}`,
                type: 'system'
            });

            return newBrand;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear marca: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar marca
    async updateBrand(id, data, currentUser, req) {
        const brand = await brandRepository.findById(id, currentUser.tenant_id);
        if (!brand) throw new Error('Marca no encontrada');

        if (data.name && data.name !== brand.name) {
            if (await brandRepository.findByName(data.name, currentUser.tenant_id)) {
                throw new Error('Ese nombre ya está en uso en tu tenant');
            }
        }

        await brandRepository.updateBrand(brand, data);

        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'brands',
            description: `Marca actualizada: ${brand.name}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación global (opcional pero coherente)
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Marca actualizada',
            message: `Se actualizó la marca ${brand.name}`,
            type: 'system'
        });

        return brand;
    }

    // 🔴 Eliminar marca
    async deleteBrand(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const brand = await brandRepository.findById(id, currentUser.tenant_id);
            if (!brand) throw new Error('Marca no encontrada');

            await brandRepository.softDeleteBrand(brand, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'brands',
                description: `Marca eliminada: ${brand.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Marca eliminada',
                message: `Se ha eliminado la marca ${brand.name}`,
                type: 'system'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar marca: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getBrandsDatatable(body, currentUser) {
        const draw   = parseInt(body.draw) || 1;
        const start  = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter = body['columns[2][search][value]'] || (body.columns?.[2]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await brandRepository.datatable(params, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new BrandService();
