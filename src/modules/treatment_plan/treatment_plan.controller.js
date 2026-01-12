const treatmentPlanService = require('./treatment_plan.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

class TreatmentPlanController {
    async create(req, res) {
        try {
            const plan = await treatmentPlanService.createPlan(req.body, req.user.tenant_id, req.body.patient_id);
            res.status(201).json(plan);
        } catch (error) {
            handleSequelizeError(res, error);
        }
    }

    async getByPatient(req, res) {
        try {
            const { patientId } = req.params;
            const plans = await treatmentPlanService.getPlansByPatient(patientId, req.user.tenant_id);
            res.json(plans);
        } catch (error) {
            handleSequelizeError(res, error);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await treatmentPlanService.deletePlan(id, req.user.tenant_id);
            res.json({ message: 'Treatment plan deleted successfully' });
        } catch (error) {
            handleSequelizeError(res, error);
        }
    }
}

module.exports = new TreatmentPlanController();
