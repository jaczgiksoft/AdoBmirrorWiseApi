const sequelize = require('../../config/database');
const taxRepository = require('./tax.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class TaxService {
    async getAllTaxes() {
        return taxRepository.findAll();
    }

    async getTaxById(id) {
        const tax = await taxRepository.findById(id);
        if (!tax) throw new Error('Impuesto no encontrado');
        return tax;
    }

    // 🟢 Crear impuesto
    async createTax(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (await taxRepository.findByName(data.name)) {
                throw new Error('El nombre del impuesto ya está en uso');
            }

            const newTax = await taxRepository.createTax(data, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'taxes',
                description: `Impuesto creado: ${newTax.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nuevo impuesto creado',
                message: `${currentUser.username} ha creado el impuesto "${newTax.name}" con tasa ${newTax.rate ?? 'N/A'}%.`,
                type: 'system'
            });

            return newTax;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear impuesto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar impuesto
    async updateTax(id, data, currentUser, req) {
        const tax = await taxRepository.findById(id);
        if (!tax) throw new Error('Impuesto no encontrado');

        if (data.name && data.name !== tax.name) {
            if (await taxRepository.findByName(data.name)) {
                throw new Error('Ese nombre ya está en uso');
            }
        }

        await taxRepository.updateTax(tax, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'taxes',
            description: `Impuesto actualizado: ${tax.name}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Impuesto actualizado',
            message: `${currentUser.username} actualizó el impuesto "${tax.name}".`,
            type: 'system'
        });

        return tax;
    }

    // 🔴 Eliminar impuesto
    async deleteTax(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const tax = await taxRepository.findById(id);
            if (!tax) throw new Error('Impuesto no encontrado');

            await taxRepository.softDeleteTax(tax, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'taxes',
                description: `Impuesto eliminado: ${tax.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Impuesto eliminado',
                message: `${currentUser.username} ha eliminado el impuesto "${tax.name}".`,
                type: 'system'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar impuesto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getTaxesDatatable(body) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'rate', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[3][search][value]'] || (body.columns?.[3]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await taxRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new TaxService();
