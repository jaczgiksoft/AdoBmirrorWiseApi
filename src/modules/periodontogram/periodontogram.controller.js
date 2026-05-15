// src/modules/periodontogram/periodontogram.controller.js
const periodontogramService = require('./periodontogram.service');

class PeriodontogramController {
    async getLatestByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const tenantId = req.user.tenant_id;
            const periodontogram = await periodontogramService.getLatestByPatient(patientId, tenantId);

            res.json({ success: true, data: periodontogram });
        } catch (error) {
            next(error);
        }
    }

    async getAllByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const tenantId = req.user.tenant_id;
            const periodontograms = await periodontogramService.getAllByPatient(patientId, tenantId);

            res.json({ success: true, data: periodontograms });
        } catch (error) {
            next(error);
        }
    }

    async upsert(req, res, next) {
        try {
            const data = req.body;
            const tenantId = req.user.tenant_id;

            const savedRecord = await periodontogramService.upsertPeriodontogram(data, tenantId);

            res.json({
                success: true,
                message: 'Periodontograma guardado correctamente',
                data: savedRecord
            });
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenant_id;

            await periodontogramService.deletePeriodontogram(id, tenantId);

            res.json({
                success: true,
                message: 'Registro eliminado correctamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PeriodontogramController();
