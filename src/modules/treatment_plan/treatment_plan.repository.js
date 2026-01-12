const TreatmentPlan = require('../../models/mysql/treatment_plan.model');
const TreatmentPlanItem = require('../../models/mysql/treatment_plan_item.model');
const TreatmentCatalog = require('../../models/mysql/treatment_catalog.model');

class TreatmentPlanRepository {
    async create(data, options) {
        // Sequentially create items if passed, or use include
        // Nested create is supported by Sequelize if 'include' is passed in options
        return TreatmentPlan.create(data, {
            ...options,
            include: [{ model: TreatmentPlanItem, as: 'items' }]
        });
    }

    async findAllByPatient(patientId, tenantId) {
        return TreatmentPlan.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                {
                    model: TreatmentPlanItem,
                    as: 'items',
                    // order items by order_index
                }
            ],
            order: [
                ['created_at', 'DESC'],
                [{ model: TreatmentPlanItem, as: 'items' }, 'order_index', 'ASC']
            ]
        });
    }

    async findById(id, tenantId) {
        return TreatmentPlan.findOne({
            where: { id, tenant_id: tenantId },
            include: [{ model: TreatmentPlanItem, as: 'items' }]
        });
    }

    async delete(id, tenantId, transaction) {
        return TreatmentPlan.destroy({
            where: { id, tenant_id: tenantId },
            transaction
        });
    }
}

module.exports = new TreatmentPlanRepository();
