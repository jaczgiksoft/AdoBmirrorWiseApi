const treatmentCatalogRepository = require('./treatment_catalog.repository');

class TreatmentCatalogService {
    async getCatalogs(tenantId) {
        return await treatmentCatalogRepository.findAll(tenantId);
    }

    async createCatalog(data) {
        return await treatmentCatalogRepository.create(data);
    }

    async deleteCatalog(id, tenantId) {
        return await treatmentCatalogRepository.delete(id, tenantId);
    }
}

module.exports = new TreatmentCatalogService();
