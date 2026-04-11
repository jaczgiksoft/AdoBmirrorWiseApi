// src/modules/odontogram/odontogram.controller.js
const odontogramService = require('./odontogram.service');

class OdontogramController {
    async getByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const tenantId = req.user.tenant_id;
            const odontogram = await odontogramService.getOdontogramByPatient(patientId, tenantId);

            if (!odontogram) {
                return res.json({ success: true, data: null });
            }

            res.json({ success: true, data: odontogram });
        } catch (error) {
            next(error);
        }
    }

    async save(req, res, next) {
        try {
            const { patientId, ...data } = req.body;
            const tenantId = req.user.tenant_id;

            const savedOdontogram = await odontogramService.saveOdontogram(patientId, tenantId, data);

            res.json({
                success: true,
                message: 'Odontograma guardado correctamente',
                data: savedOdontogram
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OdontogramController();
