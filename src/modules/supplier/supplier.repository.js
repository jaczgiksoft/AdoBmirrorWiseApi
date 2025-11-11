// src/modules/supplier/supplier.repository.js
const Supplier = require('../../models/mysql/supplier.model');
const { Op } = require('sequelize');

class SupplierRepository {
    /**
     * Obtiene todos los proveedores del tenant
     */
    async findAllByTenant(tenantId) {
        return Supplier.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }

    /**
     * Busca un proveedor por ID
     */
    async findById(id, tenantId) {
        return Supplier.findOne({
            where: { id, tenant_id: tenantId },
        });
    }

    /**
     * Busca un proveedor por nombre (para evitar duplicados)
     */
    async findByName(name, tenantId) {
        return Supplier.findOne({
            where: {
                name,
                tenant_id: tenantId,
            },
        });
    }

    /**
     * Crea un nuevo proveedor
     */
    async createSupplier(data, transaction) {
        const allowedFields = [
            'tenant_id',
            'name',
            'contact_name',
            'phone',
            'email',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'tax_id',
            'website',
            'notes',
            'status',
        ];

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        return Supplier.create(filteredData, { transaction });
    }

    /**
     * Actualiza los datos de un proveedor
     */
    async updateSupplier(supplier, data) {
        const allowedFields = [
            'name',
            'contact_name',
            'phone',
            'email',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'tax_id',
            'website',
            'notes',
            'status',
        ];

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        return supplier.update(filteredData);
    }

    /**
     * Soft delete (paranoid)
     */
    async softDeleteSupplier(supplier, transaction) {
        supplier.status = 'inactive';
        await supplier.save({ transaction });
        await supplier.destroy({ transaction }); // paranoid soft delete
    }

    /**
     * Datatable — búsqueda paginada y filtrable
     */
    async datatable(params, tenantId) {
        const {
            start,
            length,
            searchValue,
            orderColumn,
            orderDir,
            statusFilter,
            city,
            state,
        } = params;

        const andConditions = [{ tenant_id: tenantId }];

        // 🔍 Búsqueda general (name, contact_name, email, phone)
        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { contact_name: { [Op.like]: `%${searchValue}%` } },
                    { email: { [Op.like]: `%${searchValue}%` } },
                    { phone: { [Op.like]: `%${searchValue}%` } },
                ],
            });
        }

        // 🔹 Filtros específicos
        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }
        if (city && city.trim() !== '') {
            andConditions.push({ city: { [Op.like]: `%${city.trim()}%` } });
        }
        if (state && state.trim() !== '') {
            andConditions.push({ state: { [Op.like]: `%${state.trim()}%` } });
        }

        const where = { [Op.and]: andConditions };

        const recordsTotal = await Supplier.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await Supplier.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new SupplierRepository();
