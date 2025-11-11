// check-db-imports.js
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

function searchFiles(dir) {
    const results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results.push(...searchFiles(fullPath));
        } else if (item.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes("require('../../config/mysql'") ||
                content.includes("require('../config/mysql'") ||
                content.includes("require('../../config/mssql'") ||
                content.includes("require('../config/mssql'")) {
                results.push(fullPath);
            }
        }
    }

    return results;
}

const files = searchFiles(baseDir);

if (files.length === 0) {
    console.log("✅ No se encontraron imports directos de mysql.js o mssql.js");
} else {
    console.log("⚠️ Archivos con imports directos de mysql.js o mssql.js:");
    files.forEach(f => console.log(" - " + f));
}
