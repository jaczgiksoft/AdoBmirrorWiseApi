const treatmentPlanRepository = require('./treatment_plan.repository');
const sequelize = require('../../config/database');

class TreatmentPlanService {
    async createPlan(data, tenantId, patientId) {
        const transaction = await sequelize.transaction();

        try {
            // 🔽 Validación opcional de JSON (recomendado)
            if (data.diagnosis_content) {
                try {
                    JSON.parse(data.diagnosis_content);
                } catch {
                    throw new Error('Invalid diagnosis_content JSON');
                }
            }

            // Pre-process items to handle "Create or Find" for Catalog
            const rawItems = data.treatments || [];

            const processedItems = await Promise.all(
                rawItems.map(async (item, index) => {
                    let catalogId = item.catalog_id;

                    if (!catalogId && item.title) {
                        const TreatmentCatalog = require('../../models/mysql/treatment_catalog.model');

                        const existingCatalog = await TreatmentCatalog.findOne({
                            where: {
                                tenant_id: tenantId,
                                title: item.title
                            },
                            transaction
                        });

                        if (existingCatalog) {
                            catalogId = existingCatalog.id;
                        } else {
                            const newCatalog = await TreatmentCatalog.create({
                                tenant_id: tenantId,
                                title: item.title,
                                description: item.description,
                                color: item.color || 'blue'
                            }, { transaction });

                            catalogId = newCatalog.id;
                        }
                    }

                    return {
                        title: item.title,
                        description: item.description,
                        color: item.color,
                        tenant_id: tenantId,
                        catalog_id: catalogId,
                        order_index: index
                    };
                })
            );

            // 🔽 Aquí agregamos los nuevos campos
            const planData = {
                ...data,
                tenant_id: tenantId,
                patient_id: patientId,
                items: processedItems,

                diagnosis_content: data.diagnosis_content || null,
                diagnosis_content_html: data.diagnosis_content_html || null
            };

            const newPlan = await treatmentPlanRepository.create(planData, { transaction });

            await transaction.commit();
            return newPlan;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getPlansByPatient(patientId, tenantId) {
        return await treatmentPlanRepository.findAllByPatient(patientId, tenantId);
    }

    async deletePlan(id, tenantId) {
        const transaction = await sequelize.transaction();
        try {
            await treatmentPlanRepository.delete(id, tenantId, transaction);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new TreatmentPlanService();
