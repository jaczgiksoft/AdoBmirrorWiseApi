// src/modules/log/log.service.js
const logRepository = require('./log.repository');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class LogService {
    async getLogs(queryParams, currentUser, req) {
        if (!currentUser.permissions?.logs?.read && !currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }

        const { module, user_id, action, desde, hasta, limit = 100, skip = 0 } = queryParams;
        const query = {};

        if (module) query.module = module;
        if (user_id) query.user_id = Number(user_id);
        if (action) query.action = action;

        if (desde || hasta) {
            query.created_at = {};
            if (desde) query.created_at.$gte = new Date(desde.length === 10 ? `${desde}T00:00:00` : desde);
            if (hasta) query.created_at.$lte = new Date(hasta.length === 10 ? `${hasta}T23:59:59` : hasta);
        }

        try {
            const logs = await logRepository.find(query, { skip: parseInt(skip), limit: parseInt(limit) });

            return logs.map(l => ({
                id: l._id,
                user_id: l.user_id,
                user_name: l.user_name,
                action: l.action,
                module: l.module,
                description: l.description,
                ip: l.ip,
                user_agent: l.user_agent,
                created_at: l.created_at
            }));
        } catch (err) {
            logger.error(`Error en getLogs: ${err.message}`);
            await logApiError(req, err);
            throw new Error('Error al obtener logs del sistema');
        }
    }

    async getRecentLogs(limit = 20, currentUser, req) {
        if (!currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }

        try {
            const logs = await logRepository.findRecent(limit);
            return logs.map(l => ({
                id: l._id,
                user_id: l.user_id,
                user_name: l.user_name,
                action: l.action,
                module: l.module,
                description: l.description,
                created_at: l.created_at
            }));
        } catch (err) {
            logger.error(`Error en getRecentLogs: ${err.message}`);
            await logApiError(req, err);
            throw new Error('Error al obtener actividad reciente');
        }
    }

    async getLastByModule(module) {
        const log = await logRepository.findLastByModule(module);
        if (!log) return { success: true, log: null };

        return {
            success: true,
            log: {
                created_at: log.created_at,
                user_name: log.user_name,
                action: log.action,
                description: log.description
            }
        };
    }

    async getLogsDatatable(body, currentUser) {
        if (!currentUser.permissions?.logs?.read && !currentUser.is_superadmin) {
            throw new Error('No autorizado');
        }

        const draw   = parseInt(body.draw) || 1;
        const start  = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        // Columnas disponibles en DataTables
        const columns = [
            null,           // 0 contador
            'user_name',    // 1
            'action',       // 2
            'module',       // 3
            'description',  // 4
            'created_at'    // 5
        ];
        const orderColumn = columns[orderColumnIndex] || 'created_at';

        const filters = {
            module: body['columns[3][search][value]'] || (body.columns?.[3]?.search?.value ?? ''),
            action: body['columns[2][search][value]'] || (body.columns?.[2]?.search?.value ?? '')
        };

        const { recordsTotal, recordsFiltered, rows } =
            await logRepository.datatable({ start, length, searchValue, orderColumn, orderDir, filters });

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data: rows.map(l => ({
                id: l._id,
                user_id: l.user_id,
                user_name: l.user_name,
                action: l.action,
                module: l.module,
                description: l.description,
                ip: l.ip,
                user_agent: l.user_agent,
                created_at: l.created_at
            }))
        };
    }

}

module.exports = new LogService();
