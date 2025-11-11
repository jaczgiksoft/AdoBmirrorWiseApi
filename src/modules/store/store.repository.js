// src/modules/store/store.repository.js
const Store = require('../../models/mysql/store.model');
const { Op } = require('sequelize');

class StoreRepository {
    // 🧾 Listar todas las tiendas del tenant
    async findAllByTenant(tenantId) {
        return Store.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }

    // 🔍 Buscar por ID
    async findById(id, tenantId) {
        return Store.findOne({ where: { id, tenant_id: tenantId } });
    }

    // 🔍 Buscar por código único
    async findByCode(code, tenantId) {
        return Store.findOne({ where: { code, tenant_id: tenantId } });
    }

    // 🟢 Crear tienda
    async createStore(data, transaction) {
        const allowedFields = [
            'tenant_id',
            'name',
            'code',
            'logo_url',
            'banner_url',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'tax_id',
            'legal_name',
            'regime',
            'certificate_path',
            'key_path',
            'certificate_password',
            'status',
            'timezone',
            'opening_hours',
            'currency',
            'exchange_rate',
            'profit_margin',
            'use_parent_config',
            'use_parent_tax_data',
        ];

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        return Store.create(filteredData, { transaction });
    }

    // 🟡 Actualizar tienda
    async updateStore(store, data) {
        const allowedFields = [
            'name',
            'logo_url',
            'banner_url',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'tax_id',
            'legal_name',
            'regime',
            'certificate_path',
            'key_path',
            'certificate_password',
            'status',
            'timezone',
            'opening_hours',
            'currency',
            'exchange_rate',
            'profit_margin',
            'use_parent_config',
            'use_parent_tax_data',
        ];

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        return store.update(filteredData);
    }

    // 🔴 Eliminado lógico (soft delete)
    async softDeleteStore(store, transaction) {
        store.status = 'inactive';
        await store.save({ transaction });
        await store.destroy({ transaction }); // paranoid
    }

    // 📊 Datatable con filtros y búsqueda
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
            currency,
        } = params;

        const andConditions = [{ tenant_id: tenantId }];

        // 🔍 Búsqueda global
        if (searchValue?.trim()) {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { code: { [Op.like]: `%${searchValue}%` } },
                    { city: { [Op.like]: `%${searchValue}%` } },
                    { state: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } },
                ],
            });
        }

        // 🔹 Filtros individuales
        if (statusFilter?.trim()) {
            andConditions.push({ status: statusFilter.trim() });
        }

        if (city?.trim()) {
            andConditions.push({ city: { [Op.like]: `%${city.trim()}%` } });
        }

        if (state?.trim()) {
            andConditions.push({ state: { [Op.like]: `%${state.trim()}%` } });
        }

        if (currency?.trim()) {
            andConditions.push({ currency: currency.trim() });
        }

        const where = { [Op.and]: andConditions };

        // 🔢 Totales
        const recordsTotal = await Store.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await Store.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new StoreRepository();
