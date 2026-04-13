const sequelize = require('./src/config/database');
require('./src/models/mysql/associations');

async function sync() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Sync complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
