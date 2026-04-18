const patientElasticService = require('./patient_elastic.service');

class PatientElasticController {
    async getByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const tenantId = req.user.tenant_id;
            const elastics = await patientElasticService.getPatientElastics(patientId, tenantId);

            res.json({ success: true, data: elastics });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const tenantId = req.user.tenant_id;
            if (req.file) {
                const cleanPath = req.file.path.replace(/^.*uploads[\\/]/, "uploads/");
                req.body.preview_image_url = cleanPath.replace(/\\/g, "/");
            }

            const data = {
                ...req.body,
                tenant_id: tenantId
            };

            const savedElastic = await patientElasticService.createPatientElastic(data);

            res.json({
                success: true,
                message: 'Instrucción de elásticos guardada correctamente',
                data: savedElastic
            });
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenant_id;

            await patientElasticService.deletePatientElastic(id, tenantId);

            res.json({
                success: true,
                message: 'Instrucción eliminada correctamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PatientElasticController();
