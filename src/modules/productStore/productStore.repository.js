// src/modules/productStore/productStore.repository.js
const ProductStore = require('../../models/mysql/productStore.model');
const Product = require('../../models/mysql/product.model');
const Store = require('../../models/mysql/store.model');
const { Op } = require('sequelize');

class ProductStoreRepository {
    /**
     * 🔹 Obtener todos los registros de una tienda (solo activos)
     */
    async findAllByStore(tenantId, storeId) {
        return ProductStore.findAll({
            where: { tenant_id: tenantId, store_id: storeId, status: 'active' },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'sku', 'barcode', 'name', 'profit_margin', 'is_bulk'],
                },
            ],
            order: [['id', 'ASC']],
        });
    }

    /**
     * 🔹 Buscar por ID dentro de una tienda (y tenant)
     */
    async findById(id, storeId, tenantId) {
        return ProductStore.findOne({
            where: { id, store_id: storeId, tenant_id: tenantId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'sku', 'name', 'barcode', 'profit_margin'],
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'code'],
                },
            ],
        });
    }

    /**
     * 🔹 Buscar por producto y tienda
     */
    async findByProduct(productId, storeId) {
        return ProductStore.findOne({
            where: { product_id: productId, store_id: storeId },
        });
    }

    /**
     * 🔹 Crear relación producto ↔ tienda
     */
    async createProductStore(data, transaction) {
        return ProductStore.create(data, { transaction });
    }

    /**
     * 🔹 Buscar relación específica
     */
    async findByStoreAndProduct(storeId, productId) {
        return ProductStore.findOne({ where: { store_id: storeId, product_id: productId } });
    }

    /**
     * 🔹 Actualizar relación producto ↔ tienda
     */
    async updateProductStore(productStore, data) {
        return productStore.update(data);
    }

    /**
     * 🔹 Soft delete (paranoid)
     */
    async softDeleteProductStore(productStore, transaction) {
        productStore.status = 'inactive';
        await productStore.save({ transaction });
        await productStore.destroy({ transaction });
    }

    /**
     * 📊 Datatable con búsqueda avanzada (por producto o stock)
     */
    async datatable(params, storeId, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [{ store_id: storeId }, { tenant_id: tenantId }];

        // 🔍 Búsqueda libre
        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { '$product.name$': { [Op.like]: `%${searchValue}%` } },
                    { '$product.sku$': { [Op.like]: `%${searchValue}%` } },
                    { '$product.barcode$': { [Op.like]: `%${searchValue}%` } },
                    { stock: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } },
                ],
            });
        }

        // 🔹 Filtro de estado
        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = { [Op.and]: andConditions };

        // Totales
        const recordsTotal = await ProductStore.count({ where: { store_id: storeId, tenant_id: tenantId } });

        // Resultados con join a Product
        const { rows, count: recordsFiltered } = await ProductStore.findAndCountAll({
            where,
            offset: start,
            limit: length,
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'sku', 'barcode', 'name', 'profit_margin', 'is_bulk'],
                },
            ],
            order: [[orderColumn, orderDir]],
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new ProductStoreRepository();
