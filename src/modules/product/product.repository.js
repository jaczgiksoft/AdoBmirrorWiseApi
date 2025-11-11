// src/modules/product/product.repository.js
const Product = require('../../models/mysql/product.model');
const { Op } = require('sequelize');

class ProductRepository {
    /**
     * 🔹 Obtener todos los productos del tenant
     */
    async findAll(tenantId) {
        return Product.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
            attributes: [
                'id',
                'sku',
                'barcode',
                'name',
                'status',
                'profit_margin',
                'promo_price',
                'is_pack',
                'is_bulk',
                'unit_base_name',
                'unit_purchase_name',
            ],
        });
    }

    /**
     * 🔹 Buscar producto por ID
     */
    async findById(id, tenantId) {
        return Product.findOne({
            where: { id, tenant_id: tenantId },
            attributes: {
                exclude: ['deleted_at'],
            },
        });
    }

    /**
     * 🔹 Buscar producto por SKU
     */
    async findBySku(sku, tenantId) {
        return Product.findOne({
            where: {
                tenant_id: tenantId,
                sku: sku.trim(),
            },
        });
    }

    /**
     * 🔹 Buscar producto por código de barras
     */
    async findByBarcode(barcode, tenantId) {
        return Product.findOne({
            where: {
                tenant_id: tenantId,
                barcode: barcode.trim(),
            },
        });
    }

    /**
     * 🔹 Crear producto
     */
    async createProduct(data, transaction) {
        return Product.create(data, { transaction });
    }

    /**
     * 🔹 Actualizar producto
     */
    async updateProduct(product, data, transaction) {
        return product.update(data, { transaction });
    }

    /**
     * 🔹 Eliminación lógica (soft delete)
     */
    async softDeleteProduct(product, transaction) {
        product.status = 'inactive';
        await product.save({ transaction });
        await product.destroy({ transaction }); // Sequelize 'paranoid' -> marca deleted_at
    }

    /**
     * 🔹 DataTable con búsqueda, filtros y paginación
     */
    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [{ tenant_id: tenantId }];

        // 🔍 Búsqueda global
        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { sku: { [Op.like]: `%${searchValue}%` } },
                    { barcode: { [Op.like]: `%${searchValue}%` } },
                    { unit_base_name: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } },
                ],
            });
        }

        // 🎯 Filtro por estado
        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = { [Op.and]: andConditions };

        // 🔢 Totales
        const recordsTotal = await Product.count({ where: { tenant_id: tenantId } });

        // 📄 Consulta paginada
        const { rows, count: recordsFiltered } = await Product.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
            attributes: [
                'id',
                'sku',
                'barcode',
                'name',
                'profit_margin',
                'promo_price',
                'is_pack',
                'is_bulk',
                'status',
                'created_at',
            ],
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new ProductRepository();
