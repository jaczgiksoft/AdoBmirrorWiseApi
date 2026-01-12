const TreatmentCatalog = require('../../models/mysql/treatment_catalog.model');

class TreatmentCatalogRepository {
    async findAll(tenantId) {
        return TreatmentCatalog.findAll({
            where: { tenant_id: tenantId },
            order: [['title', 'ASC']]
        });
    }

    async create(data, transaction) {
        return TreatmentCatalog.create(data, { transaction });
    }

    async delete(id, tenantId) {
        return TreatmentCatalog.destroy({
            where: { id, tenant_id: tenantId }
        });
    }
}

module.exports = new TreatmentCatalogRepository();
