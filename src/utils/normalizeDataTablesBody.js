// utils/normalizeDataTablesBody.js (o donde lo tengas)
function normalizeDataTablesBody(req, _res, next) {
    const b = req.body || {};

    // Asegura objetos
    if (!b.search && (b['search[value]'] != null || b['search[regex]'] != null)) {
        b.search = {};
    }
    if (!b.order && (b['order[0][column]'] != null || b['order[0][dir]'] != null)) {
        b.order = [];
    }
    if (!b.columns && b['columns[0][data]'] != null) {
        b.columns = [];
    }
    if (!b.filters) b.filters = {};

    // Normaliza search
    if (b['search[value]'] != null) b.search.value = b['search[value]'];
    if (b['search[regex]'] != null) b.search.regex = b['search[regex]'] === 'true';

    // Normaliza order (solo el primero; amplía si necesitas varios)
    if (b['order[0][column]'] != null || b['order[0][dir]'] != null) {
        b.order[0] = b.order[0] || {};
        if (b['order[0][column]'] != null) b.order[0].column = Number(b['order[0][column]']);
        if (b['order[0][dir]'] != null)    b.order[0].dir    = String(b['order[0][dir]']);
    }

    // Normaliza columns (mínimo indispensable)
    if (b['columns[0][data]'] != null) {
        let i = 0;
        while (b[`columns[${i}][data]`] != null) {
            b.columns[i] = b.columns[i] || {};
            b.columns[i].data       = b[`columns[${i}][data]`];
            b.columns[i].name       = b[`columns[${i}][name]`];
            b.columns[i].searchable = b[`columns[${i}][searchable]`] === 'true';
            b.columns[i].orderable  = b[`columns[${i}][orderable]`] === 'true';
            b.columns[i].search = {
                value: b[`columns[${i}][search][value]`] ?? '',
                regex: b[`columns[${i}][search][regex]`] === 'true'
            };
            i++;
        }
    }

    // 🔥 Normaliza filters[clave] -> filters.clave (acepta cualquier clave)
    for (const k of Object.keys(b)) {
        const m = k.match(/^filters\[(.+?)\]$/);
        if (m) {
            const key = m[1];
            b.filters[key] = b[k];
            // opcional: elimina la clave “aplanada”
            // delete b[k];
        }
    }

    req.body = b;
    next();
}

module.exports = { normalizeDataTablesBody };
