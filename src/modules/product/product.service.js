const sequelize = require('../../config/database');
const productRepository = require('./product.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class ProductService {
    // 🧾 Obtener todos los productos
    async getAllProducts(currentUser) {
        return productRepository.findAll(currentUser.tenant_id);
    }

    // 🔍 Obtener un producto por ID
    async getProductById(id, currentUser) {
        const product = await productRepository.findById(id, currentUser.tenant_id);
        if (!product) throw new Error('Producto no encontrado');
        return product;
    }

    // 🟢 Crear producto
    async createProduct(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            // 🔹 Validar SKU único
            if (await productRepository.findBySku(data.sku, currentUser.tenant_id)) {
                throw new Error('El SKU ya está en uso');
            }

            // 🔹 Validar código de barras único
            if (data.barcode) {
                const existingBarcode = await productRepository.findByBarcode(
                    data.barcode,
                    currentUser.tenant_id
                );
                if (existingBarcode) {
                    throw new Error('El código de barras ya está en uso');
                }
            }

            // 🔹 Validaciones de consistencia
            if (data.is_pack && (!data.units_per_pack || data.units_per_pack <= 0)) {
                throw new Error(
                    'Debe especificar una cantidad válida en "units_per_pack" si el producto es un paquete'
                );
            }

            if (data.is_bulk && data.is_pack) {
                throw new Error('Un producto no puede ser a la vez "paquete" y "a granel"');
            }

            // 🔹 Normalización y herencia
            const payload = {
                tenant_id: currentUser.tenant_id,
                sku: data.sku.trim(),
                barcode: data.barcode?.trim() || null,
                name: data.name.trim(),
                description: data.description?.trim() || null,
                image_url: data.image_url || null,
                department_store_id: data.department_store_id ?? null,
                category_id: data.category_id ?? null,
                brand_id: data.brand_id ?? null,
                unit_id: data.unit_id ?? null,
                tax_id: data.tax_id ?? null,
                profit_margin: data.profit_margin ?? null, // herencia si es null
                promo_price: data.promo_price ?? null,
                is_tax_included: data.is_tax_included ?? true,
                stock_control: data.stock_control ?? true,
                is_pack: data.is_pack ?? false,
                units_per_pack: data.units_per_pack ?? null,
                is_bulk: data.is_bulk ?? false,
                unit_base_name: data.unit_base_name ?? null,
                unit_purchase_name: data.unit_purchase_name ?? null,
                is_kit: data.is_kit ?? false,
                has_variants: data.has_variants ?? false,
                status: data.status ?? 'active',
            };

            const newProduct = await productRepository.createProduct(payload, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'products',
                description: `Producto creado: ${newProduct.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nuevo producto creado',
                message: `${currentUser.username} ha creado el producto ${newProduct.name}.`,
                type: 'system',
            });

            return newProduct;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear producto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar producto
    async updateProduct(id, data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const product = await productRepository.findById(id, currentUser.tenant_id);
            if (!product) throw new Error('Producto no encontrado');

            // 🔹 SKU duplicado
            if (data.sku && data.sku !== product.sku) {
                if (await productRepository.findBySku(data.sku, currentUser.tenant_id)) {
                    throw new Error('El SKU ya está en uso por otro producto');
                }
            }

            // 🔹 Código de barras duplicado
            if (data.barcode && data.barcode !== product.barcode) {
                const existingBarcode = await productRepository.findByBarcode(
                    data.barcode,
                    currentUser.tenant_id
                );
                if (existingBarcode) {
                    throw new Error('El código de barras ya está en uso');
                }
            }

            // 🔹 Validaciones lógicas
            if (data.is_pack && (!data.units_per_pack || data.units_per_pack <= 0)) {
                throw new Error(
                    'Debe especificar una cantidad válida en "units_per_pack" si el producto es un paquete'
                );
            }

            if (data.is_bulk && data.is_pack) {
                throw new Error('Un producto no puede ser simultáneamente "paquete" y "a granel"');
            }

            // 🔹 Normalización de campos
            const updatedData = {
                sku: data.sku?.trim() ?? product.sku,
                barcode: data.barcode?.trim() ?? product.barcode,
                name: data.name?.trim() ?? product.name,
                description: data.description?.trim() ?? product.description,
                image_url: data.image_url ?? product.image_url,
                department_store_id: data.department_store_id ?? product.department_store_id,
                category_id: data.category_id ?? product.category_id,
                brand_id: data.brand_id ?? product.brand_id,
                unit_id: data.unit_id ?? product.unit_id,
                tax_id: data.tax_id ?? product.tax_id,
                profit_margin: data.profit_margin ?? product.profit_margin,
                promo_price: data.promo_price ?? product.promo_price,
                is_tax_included: data.is_tax_included ?? product.is_tax_included,
                stock_control: data.stock_control ?? product.stock_control,
                is_pack: data.is_pack ?? product.is_pack,
                units_per_pack: data.units_per_pack ?? product.units_per_pack,
                is_bulk: data.is_bulk ?? product.is_bulk,
                unit_base_name: data.unit_base_name ?? product.unit_base_name,
                unit_purchase_name: data.unit_purchase_name ?? product.unit_purchase_name,
                is_kit: data.is_kit ?? product.is_kit,
                has_variants: data.has_variants ?? product.has_variants,
                status: data.status ?? product.status,
            };

            await productRepository.updateProduct(product, updatedData, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'products',
                description: `Producto actualizado: ${product.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Producto actualizado',
                message: `El producto ${product.name} ha sido actualizado por ${currentUser.username}.`,
                type: 'system',
            });

            return product;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar producto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminación lógica
    async deleteProduct(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const product = await productRepository.findById(id, currentUser.tenant_id);
            if (!product) throw new Error('Producto no encontrado');

            await productRepository.softDeleteProduct(product, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'products',
                description: `Producto eliminado: ${product.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Producto eliminado',
                message: `${currentUser.username} ha eliminado el producto ${product.name}.`,
                type: 'system',
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar producto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getProductsDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'sku', 'barcode', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[4][search][value]'] || (body.columns?.[4]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } = await productRepository.datatable(
            params,
            currentUser.tenant_id
        );

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new ProductService();
