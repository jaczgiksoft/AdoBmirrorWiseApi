// src/modules/log/log.repository.js
const SystemLog = require('../../models/mongo/systemLog.model');

class LogRepository {
    async find(query, { skip = 0, limit = 100 } = {}) {
        return SystemLog.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
    }

    async findRecent(limit = 20) {
        return SystemLog.find({})
            .sort({ created_at: -1 })
            .limit(limit);
    }

    async findLastByModule(module) {
        return SystemLog.findOne({ module }).sort({ created_at: -1 });
    }

    async createLog(data) {
        return SystemLog.create(data);
    }

    async datatable({ start, length, searchValue, orderColumn, orderDir, filters }) {
        const query = {};

        // 🔎 Filtros
        if (filters?.module) query.module = filters.module;
        if (filters?.user_id) query.user_id = Number(filters.user_id);
        if (filters?.action) query.action = filters.action;

        // 🔍 Búsqueda global
        if (searchValue && searchValue.trim() !== '') {
            query.$or = [
                { user_name: { $regex: searchValue, $options: 'i' } },
                { action: { $regex: searchValue, $options: 'i' } },
                { module: { $regex: searchValue, $options: 'i' } },
                { description: { $regex: searchValue, $options: 'i' } }
            ];
        }

        const recordsTotal = await SystemLog.countDocuments({});
        const recordsFiltered = await SystemLog.countDocuments(query);

        const rows = await SystemLog.find(query)
            .sort({ [orderColumn]: orderDir === 'ASC' ? 1 : -1 })
            .skip(start)
            .limit(length);

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new LogRepository();
