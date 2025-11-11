const sequelize = require('../../config/database');
const inventoryMovementRepository = require('./inventoryMovement.repository');
const productStoreRepository = require('../productStore/productStore.repository'); // para actualizar stock
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { notifyUser } = require('../../utils/notify.helper');
const { logger } = require('../../utils/logger');

class InventoryMovementService {
    // 🧾 Crear movimiento de inventario
    async createMovement(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            // 1️⃣ Obtener stock actual
            const productStore = await productStoreRepository.findByStoreAndProduct(
                data.store_id,
                data.product_id
            );
            if (!productStore) throw new Error('Producto no asignado a la tienda');

            const previousStock = parseFloat(productStore.stock || 0);
            let newStock = previousStock;

            // 2️⃣ Calcular nuevo stock según tipo de movimiento
            if (data.type === 'in') {
                newStock += parseFloat(data.quantity);
            } else if (data.type === 'out') {
                if (previousStock < data.quantity) throw new Error('Stock insuficiente');
                newStock -= parseFloat(data.quantity);
            } else if (data.type === 'adjustment') {
                newStock = parseFloat(data.new_stock);
            }

            // 3️⃣ Actualizar stock
            await productStore.update({ stock: newStock }, { transaction: t });

            // 4️⃣ Registrar movimiento
            const movement = await inventoryMovementRepository.createMovement(
                {
                    ...data,
                    tenant_id: currentUser.tenant_id,
                    user_id: currentUser.id,
                    previous_stock: previousStock,
                    new_stock: newStock
                },
                t
            );

            await t.commit();

            // 5️⃣ Registrar log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'inventory_movements',
                description: `Movimiento de inventario (${data.type}) registrado para producto ${data.product_id} - Cantidad: ${data.quantity}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 6️⃣ Generar notificación
            let title = '';
            let message = '';
            let type = 'system'; // todas las notificaciones serán globales

            switch (data.type) {
                case 'in':
                    title = 'Entrada de inventario';
                    message = `${currentUser.username} registró una entrada de ${data.quantity} unidades para el producto ${data.product_id}.`;
                    break;

                case 'out':
                    title = 'Salida de inventario';
                    message = `${currentUser.username} registró una salida de ${data.quantity} unidades para el producto ${data.product_id}.`;
                    break;

                case 'adjustment':
                    title = 'Ajuste de inventario';
                    message = `${currentUser.username} ajustó el stock del producto ${data.product_id} a ${newStock} unidades.`;
                    break;
            }

            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title,
                message,
                type
            });

            // 7️⃣ Notificación adicional por bajo stock
            const minStock = parseFloat(productStore.min_stock || 0);
            if (newStock <= minStock) {
                await notifyUser({
                    user_id: currentUser.id,
                    tenant_id: currentUser.tenant_id,
                    title: '⚠️ Alerta de stock bajo',
                    message: `El producto ${data.product_id} alcanzó un stock bajo (${newStock} unidades, mínimo ${minStock}).`,
                    type: 'system'
                });
            }

            return movement;
        } catch (err) {
            await t.rollback();
            logger.error(`Error en movimiento de inventario: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async getMovementById(id, currentUser) {
        const movement = await inventoryMovementRepository.findById(id, currentUser.tenant_id);
        if (!movement) throw new Error('Movimiento no encontrado');
        return movement;
    }

    async getMovementsDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'type', 'reason', 'quantity', 'created_at', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = {
            start,
            length,
            searchValue,
            orderColumn,
            orderDir,
            storeId: body.store_id || null,
            productId: body.product_id || null
        };

        const { recordsTotal, recordsFiltered, rows } =
            await inventoryMovementRepository.datatable(params, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new InventoryMovementService();
