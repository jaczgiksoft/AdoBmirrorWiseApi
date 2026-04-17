const systemService = require("./system.service");

async function getAppVersion(req, res) {
    try {
        const data = await systemService.getAppVersion();

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting app version" });
    }
}

module.exports = {
    getAppVersion
};