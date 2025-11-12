// src/modules/bracket_type/bracket_type.service.js
const sequelize = require('../../config/database');
const bracketTypeRepository = require('./bracket_type.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class BracketTypeService {
    // 📋 Listar todos los tipos de brackets del tenant
    async getAll(currentUser) {
        const { tenant_id } = currentUser;
        return bracketTypeRepository.findAll(tenant_id);
    }

    // 🔍 Obtener uno por ID
    async getById(id, currentUser) {
        const { tenant_id } = currentUser;
        const bracketType = await bracketTypeRepository.findById(id, tenant_id);
        if (!bracketType) throw new Error('Tipo de bracket no encontrado');
        return bracketType;
    }

    // 🟢 Crear nuevo tipo de bracket
    async create(data, currentUser, req) {
        const { tenant_id, id: user_id, username } = currentUser;
        const t = await sequelize.transaction();

        try {
            // Evitar duplicados
            const exists = await bracketTypeRepository.findByName(data.name, tenant_id);
            if (exists) throw new Error('Ya existe un tipo de bracket con ese nombre');

            const payload = {
                tenant_id,
                name: data.name.trim(),
                description: data.description || null,
                material: data.material || null,
                manufacturer: data.manufacturer || null,
                color: data.color || '#CCCCCC',
            };

            const bracketType = await bracketTypeRepository.createBracketType(payload, t);
            await t.commit();

            // Registro de log
            await createLog({
                user_id,
                user_name: username,
                action: 'create',
                module: 'bracket_types',
                description: `Creó el tipo de bracket "${bracketType.name}"`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // Notificación opcional
            await notifyUser({
                user_id,
                title: 'Nuevo tipo de bracket',
                message: `${username} ha creado el tipo "${bracketType.name}"`,
                type: 'info',
            });

            return bracketType;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear tipo de bracket: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar tipo de bracket
    async update(id, data, currentUser, req) {
        const { tenant_id, id: user_id, username } = currentUser;
        const t = await sequelize.transaction();

        try {
            const bracketType = await bracketTypeRepository.findById(id, tenant_id);
            if (!bracketType) throw new Error('Tipo de bracket no encontrado');

            // Evitar duplicado de nombre
            if (data.name && data.name !== bracketType.name) {
                const exists = await bracketTypeRepository.findByName(data.name, tenant_id);
                if (exists) throw new Error('Ya existe un tipo de bracket con ese nombre');
            }

            const payload = {
                name: data.name?.trim() ?? bracketType.name,
                description: data.description ?? bracketType.description,
                material: data.material ?? bracketType.material,
                manufacturer: data.manufacturer ?? bracketType.manufacturer,
                color: data.color ?? bracketType.color,
            };

            await bracketTypeRepository.updateBracketType(bracketType, payload, t);
            await t.commit();

            await createLog({
                user_id,
                user_name: username,
                action: 'update',
                module: 'bracket_types',
                description: `Actualizó el tipo de bracket "${bracketType.name}"`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            await notifyUser({
                user_id,
                title: 'Tipo de bracket actualizado',
                message: `${username} actualizó "${bracketType.name}"`,
                type: 'info',
            });

            return bracketType;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar tipo de bracket: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar (soft delete)
    async delete(id, currentUser, req) {
        const { tenant_id, id: user_id, username } = currentUser;
        const t = await sequelize.transaction();

        try {
            const bracketType = await bracketTypeRepository.findById(id, tenant_id);
            if (!bracketType) throw new Error('Tipo de bracket no encontrado');

            await bracketTypeRepository.softDeleteBracketType(bracketType, t);
            await t.commit();

            await createLog({
                user_id,
                user_name: username,
                action: 'delete',
                module: 'bracket_types',
                description: `Eliminó el tipo de bracket "${bracketType.name}"`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            await notifyUser({
                user_id,
                title: 'Tipo de bracket eliminado',
                message: `${username} eliminó el tipo "${bracketType.name}"`,
                type: 'warning',
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar tipo de bracket: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📊 DataTable para listados
    async getDatatable(body, currentUser) {
        const { tenant_id } = currentUser;

        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 1);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'material', 'manufacturer', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir };

        const { recordsTotal, recordsFiltered, rows } =
            await bracketTypeRepository.datatable(params, tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new BracketTypeService();
