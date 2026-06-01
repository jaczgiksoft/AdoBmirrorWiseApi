const { Op } = require('sequelize');
const ActivityCatalog = require('../../models/mysql/activity_catalog.model');

class ActivityCatalogRepository {
    async create(data, transaction) {
        return ActivityCatalog.create(data, { transaction });
    }

    async update(activity, data, transaction) {
        return activity.update(data, { transaction });
    }

    async delete(activity, transaction) {
        return activity.destroy({ transaction });
    }

    async findById(id, tenantId) {
        return ActivityCatalog.findOne({
            where: { id, tenant_id: tenantId },
        });
    }

    async findAllByTenant(tenantId, options = {}) {
        const { search, includeInactive } = options;
        const where = { tenant_id: tenantId };

        if (!includeInactive) {
            where.is_active = true;
        }

        if (search && search.trim() !== '') {
            where.name = { [Op.like]: `%${search.trim()}%` };
        }

        return ActivityCatalog.findAll({
            where,
            order: [['name', 'ASC']],
        });
    }
}

module.exports = new ActivityCatalogRepository();
