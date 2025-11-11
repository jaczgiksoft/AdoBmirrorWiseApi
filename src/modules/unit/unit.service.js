const sequelize = require('../../config/database');
const unitRepository = require('./unit.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class UnitService {
    // 🔹 Obtener todas las unidades
    async getAllUnits() {
        return unitRepository.findAll();
    }

    // 🔹 Obtener unidad por ID
    async getUnitById(id) {
        const unit = await unitRepository.findById(id);
        if (!unit) throw new Error('Unidad no encontrada');
        return unit;
    }

    // 🟢 Crear unidad
    async createUnit(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (await unitRepository.findByName(data.name)) {
                throw new Error('El nombre de la unidad ya está en uso');
            }
            if (await unitRepository.findBySymbol(data.symbol)) {
                throw new Error('El símbolo de la unidad ya está en uso');
            }

            const newUnit = await unitRepository.createUnit(data, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'units',
                description: `Unidad creada: ${newUnit.name} (${newUnit.symbol})`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nueva unidad creada',
                message: `${currentUser.username} ha creado la unidad "${newUnit.name}" (${newUnit.symbol}).`,
                type: 'system'
            });

            return newUnit;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear unidad: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar unidad
    async updateUnit(id, data, currentUser, req) {
        const unit = await unitRepository.findById(id);
        if (!unit) throw new Error('Unidad no encontrada');

        if (data.name && data.name !== unit.name) {
            if (await unitRepository.findByName(data.name)) {
                throw new Error('Ese nombre ya está en uso');
            }
        }
        if (data.symbol && data.symbol !== unit.symbol) {
            if (await unitRepository.findBySymbol(data.symbol)) {
                throw new Error('Ese símbolo ya está en uso');
            }
        }

        await unitRepository.updateUnit(unit, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'units',
            description: `Unidad actualizada: ${unit.name} (${unit.symbol})`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Unidad actualizada',
            message: `${currentUser.username} actualizó la unidad "${unit.name}" (${unit.symbol}).`,
            type: 'system'
        });

        return unit;
    }

    // 🔴 Eliminar unidad
    async deleteUnit(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const unit = await unitRepository.findById(id);
            if (!unit) throw new Error('Unidad no encontrada');

            await unitRepository.softDeleteUnit(unit, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'units',
                description: `Unidad eliminada: ${unit.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Unidad eliminada',
                message: `${currentUser.username} eliminó la unidad "${unit.name}" (${unit.symbol}).`,
                type: 'system'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar unidad: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getUnitsDatatable(body) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'symbol', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[3][search][value]'] || (body.columns?.[3]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await unitRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new UnitService();
