const itemRepo = require('./inventory_item.repository');
const fs = require('fs');
const path = require('path');

const createItem = async (data, user) => {
    const itemData = { ...data, tenant_id: user.tenant_id };
    const item = await itemRepo.create(itemData);

    // Si se subió una imagen en carpeta temporal, moverla a una carpeta definitiva con el ID
    if (item.image && item.image.includes('/inventory/temp_')) {
        try {
            const oldRelativePath = item.image;
            const oldAbsolutePath = path.join(__dirname, '../../../', oldRelativePath);
            const tempDir = path.dirname(oldAbsolutePath);
            const parentDir = path.dirname(tempDir);
            const finalDir = path.join(parentDir, item.id.toString());

            if (fs.existsSync(tempDir)) {
                // Asegurarse de que el destino no exista (aunque no debería en un create)
                if (fs.existsSync(finalDir)) {
                    // Si por alguna razón existe, movemos los archivos adentro
                    const files = fs.readdirSync(tempDir);
                    files.forEach(file => {
                        fs.renameSync(path.join(tempDir, file), path.join(finalDir, file));
                    });
                    fs.rmdirSync(tempDir);
                } else {
                    fs.renameSync(tempDir, finalDir);
                }
                
                // Actualizar la ruta en la base de datos
                const newRelativePath = oldRelativePath.replace(/temp_\d+/, item.id.toString());
                await item.update({ image: newRelativePath });
            }
        } catch (error) {
            // No bloqueamos la creación si falla el renombrado, pero lo logueamos
            console.error('❌ Error al organizar archivos de inventario:', error);
        }
    }

    return item;
};

const getItemById = async (id, user) => {
    const item = await itemRepo.findById(id, user.tenant_id);
    if (!item) throw new Error('Artículo no encontrado');
    return item;
};

const getAllItems = async (user) => {
    return await itemRepo.findAll(user.tenant_id);
};

const updateItem = async (id, data, user) => {
    return await itemRepo.update(id, user.tenant_id, data);
};

const deleteItem = async (id, user) => {
    return await itemRepo.softDelete(id, user.tenant_id);
};

module.exports = {
    createItem,
    getItemById,
    getAllItems,
    updateItem,
    deleteItem
};
