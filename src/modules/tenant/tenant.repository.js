// src/modules/tenant/tenant.repository.js
const Tenant = require('../../models/mysql/tenant.model');
const Subscription = require('../../models/mysql/subscription.model');
const TenantModule = require('../../models/mysql/tenant_module.model');
const { Op } = require('sequelize');

class TenantRepository {
    async findAll() {
        return Tenant.findAll({ order: [['name', 'ASC']] });
    }

    async findById(id) {
        return Tenant.findByPk(id);
    }

    async findByName(name) {
        return Tenant.findOne({ where: { name } });
    }

    async createTenant(data, transaction) {
        // 🔒 Filtrar solo los campos permitidos
        const allowedFields = [
            'name', 'description', 'logo_url', 'website',
            'contact_name', 'contact_email', 'contact_phone',
            'address', 'city', 'state', 'country', 'postal_code',
            'tax_id', 'legal_name', 'regime',
            'certificate_path', 'key_path', 'certificate_password',
            'status', 'timezone', 'opening_hours', 'currency',
            'exchange_rate', 'profit_margin' // 🆕 agregado
        ];

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        return Tenant.create(filteredData, { transaction });
    }

    async updateTenant(tenant, data, transaction) {
        // 🔒 Igual filtrado de seguridad en actualizaciones
        const allowedFields = [
            'description', 'logo_url', 'website',
            'contact_name', 'contact_email', 'contact_phone',
            'address', 'city', 'state', 'country', 'postal_code',
            'tax_id', 'legal_name', 'regime',
            'certificate_path', 'key_path', 'certificate_password',
            'status', 'timezone', 'opening_hours',
            'currency', 'exchange_rate', 'profit_margin' // 🆕 agregado
        ];

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        return tenant.update(filteredData, { transaction });
    }

    async softDeleteTenant(tenant, transaction) {
        tenant.status = 'inactive';
        await tenant.save({ transaction });
        await tenant.destroy({ transaction }); // paranoid soft delete
    }

    async getSettings(tenantId) {
        return Tenant.findByPk(tenantId, {
            include: [
                { model: Subscription, as: 'currentSubscription', required: false },
                { model: TenantModule, as: 'modules' }
            ]
        });
    }

    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [];

        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { description: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } }
                ]
            });
        }

        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = andConditions.length ? { [Op.and]: andConditions } : {};

        const recordsTotal = await Tenant.count();

        const { rows, count: recordsFiltered } = await Tenant.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new TenantRepository();
