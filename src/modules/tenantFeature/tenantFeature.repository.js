// src/modules/tenant/tenantFeature.repository.js
const TenantFeature = require('../../models/mysql/tenant_feature.model');
const { Op } = require('sequelize');

class TenantFeatureRepository {
    async findAllByTenant(tenantId) {
        return TenantFeature.findAll({ where: { tenant_id: tenantId } });
    }

    async findById(id, tenantId) {
        return TenantFeature.findOne({ where: { id, tenant_id: tenantId } });
    }

    async findByFeature(tenantId, feature) {
        return TenantFeature.findOne({ where: { tenant_id: tenantId, feature } });
    }

    async createFeature(data, transaction) {
        return TenantFeature.create(data, { transaction });
    }

    async updateFeature(feature, data) {
        return feature.update(data);
    }

    async deleteFeature(feature, transaction) {
        return feature.destroy({ transaction });
    }

    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir } = params;

        const where = { tenant_id: tenantId };
        if (searchValue && searchValue.trim() !== '') {
            where.feature = { [Op.like]: `%${searchValue}%` };
        }

        const recordsTotal = await TenantFeature.count({ where: { tenant_id: tenantId } });

        const { rows, count: recordsFiltered } = await TenantFeature.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new TenantFeatureRepository();
