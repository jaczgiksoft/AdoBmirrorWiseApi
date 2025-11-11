const sequelize = require('../../config/database');
const productStoreRepository = require('./productStore.repository');
const productRepository = require('../product/product.repository');
const storeRepository = require('../store/store.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class ProductStoreService {
    // 🔹 Obtener todos los productos asignados a una tienda
    async getAllProductStores(currentUser, storeId) {
        return productStoreRepository.findAllByStore(currentUser.tenant_id, storeId);
    }

    // 🔹 Obtener un producto en tienda
    async getProductStoreById(id, storeId, currentUser) {
        const productStore = await productStoreRepository.findById(id, storeId, currentUser.tenant_id);
        if (!productStore) throw new Error('Producto en tienda no encontrado');
        return productStore;
    }

    // 🟢 Crear relación producto-tienda
    async createProductStore(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            // ✅ Validar existencia del producto
            const product = await productRepository.findById(data.product_id, currentUser.tenant_id);
            if (!product) throw new Error('El producto no existe o no pertenece a tu tenant');

            // ✅ Validar existencia de la tienda
            const store = await storeRepository.findById?.(data.store_id, currentUser.tenant_id);
            if (!store) throw new Error('La tienda no existe o no pertenece a tu tenant');

            // ✅ Evitar duplicidad
            if (await productStoreRepository.findByProduct(data.product_id, data.store_id)) {
                throw new Error('Este producto ya está asignado a la tienda');
            }

            // Crear relación producto-tienda
            const newProductStore = await productStoreRepository.createProductStore(
                {
                    ...data,
                    tenant_id: currentUser.tenant_id,
                },
                t
            );

            // Crear movimiento de inventario inicial
            const InventoryMovement = require('../../models/mysql/inventoryMovement.model');
            const initialStock = Number(data.stock) || 0;

            if (initialStock > 0) {
                await InventoryMovement.create(
                    {
                        tenant_id: currentUser.tenant_id,
                        store_id: data.store_id,
                        product_id: data.product_id,
                        user_id: currentUser.id,
                        type: 'in',
                        quantity: initialStock,
                        previous_stock: 0,
                        new_stock: initialStock,
                        reason: data.initial_reason || 'initial_stock',
                        notes: data.initial_notes || 'Creación inicial del producto en tienda',
                    },
                    { transaction: t }
                );
            }

            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'product_stores',
                description: `Producto [${product.name}] asignado a tienda [${store.name}] con stock inicial ${initialStock}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Producto asignado a tienda',
                message: `${currentUser.username} asignó el producto "${product.name}" a la tienda "${store.name}" con stock inicial de ${initialStock}.`,
                type: 'system',
            });

            return newProductStore;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear product_store: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar relación producto-tienda
    async updateProductStore(id, data, storeId, currentUser, req) {
        const productStore = await productStoreRepository.findById(id, storeId, currentUser.tenant_id);
        if (!productStore) throw new Error('Producto en tienda no encontrado');

        await productStoreRepository.updateProductStore(productStore, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'product_stores',
            description: `Actualización de producto en tienda: ID ${productStore.product_id} en tienda ${storeId}`,
            ip: req.ip,
            user_agent: req.headers['user-agent'],
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Producto actualizado en tienda',
            message: `${currentUser.username} actualizó los datos del producto ${productStore.product_id} en la tienda ${storeId}.`,
            type: 'system',
        });

        return productStore;
    }

    // 🔴 Eliminar relación producto-tienda (soft delete)
    async deleteProductStore(id, storeId, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const productStore = await productStoreRepository.findById(id, storeId, currentUser.tenant_id);
            if (!productStore) throw new Error('Producto en tienda no encontrado');

            await productStoreRepository.softDeleteProductStore(productStore, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'product_stores',
                description: `Producto ${productStore.product_id} eliminado de la tienda ${storeId}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Producto eliminado de tienda',
                message: `${currentUser.username} eliminó el producto ${productStore.product_id} de la tienda ${storeId}.`,
                type: 'system',
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar product_store: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📊 DataTable
    async getProductStoresDatatable(body, storeId, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'product_id', 'stock', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[3][search][value]'] || (body.columns?.[3]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await productStoreRepository.datatable(params, storeId, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new ProductStoreService();
