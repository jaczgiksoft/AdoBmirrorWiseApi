// src/modules/log/apiError.repository.js
const ApiError = require('../../models/mongo/apiError.model');

class ApiErrorRepository {
    async create(data) {
        return ApiError.create(data);
    }

    async findRecent(limit = 50) {
        return ApiError.find({})
            .sort({ created_at: -1 })
            .limit(limit);
    }

    async findByUser(userId, limit = 50) {
        return ApiError.find({ user_id: userId })
            .sort({ created_at: -1 })
            .limit(limit);
    }
}

module.exports = new ApiErrorRepository();
