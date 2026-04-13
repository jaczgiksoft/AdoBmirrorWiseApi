// src/modules/patient_clinical/patient_clinical.controller.js
const patientClinicalService = require('./patient_clinical.service');

class PatientClinicalController {
    async getByPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const tenantId = req.user.tenant_id;
            const record = await patientClinicalService.getPatientClinicalRecord(patientId, tenantId);

            res.json({ success: true, data: record });
        } catch (error) {
            next(error);
        }
    }

    async upsert(req, res, next) {
        try {
            const { patientId, clinicalData } = req.body;
            const tenantId = req.user.tenant_id;

            const record = await patientClinicalService.upsertPatientClinicalRecord(patientId, tenantId, clinicalData);

            res.json({
                success: true,
                message: 'Historia clínica actualizada correctamente',
                data: record
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PatientClinicalController();
