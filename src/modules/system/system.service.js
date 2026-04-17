async function getAppVersion() {
    return {
        version: "1.0.1",
        notes: "Primera prueba de updater",
        url: "http://localhost:3000/downloads/bwise-1.0.1.exe",
        mandatory: false
    };
}

module.exports = {
    getAppVersion
};