const treatmentCatalogService = require('./treatment_catalog.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

class TreatmentCatalogController {
    async getAll(req, res) {
        try {
            const catalogs = await treatmentCatalogService.getCatalogs(req.user.tenant_id);
            res.json(catalogs);
        } catch (error) {
            handleSequelizeError(res, error);
        }
    }
}

module.exports = new TreatmentCatalogController();
