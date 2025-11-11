const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        });
        logger.info('🟢 MongoDB conectado');
    } catch (error) {
        logger.error(`🔴 Error conectando a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectMongo;
