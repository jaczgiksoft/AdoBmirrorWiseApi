// src/modules/auth/blacklistedToken.repository.js
const BlacklistedToken = require('../../models/mongo/blacklistedToken.model');

class BlacklistedTokenRepository {
    async create(data) {
        return BlacklistedToken.create(data);
    }

    async findByToken(token) {
        return BlacklistedToken.findOne({ token });
    }
}

module.exports = new BlacklistedTokenRepository();
