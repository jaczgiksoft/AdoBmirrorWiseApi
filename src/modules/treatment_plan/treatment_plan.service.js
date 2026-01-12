const treatmentPlanRepository = require('./treatment_plan.repository');
const sequelize = require('../../config/database');

class TreatmentPlanService {
    async createPlan(data, tenantId, patientId) {
        const transaction = await sequelize.transaction();
        try {
            // Pre-process items to handle "Create or Find" for Catalog
            const rawItems = data.treatments || [];
            const processedItems = await Promise.all(rawItems.map(async (item, index) => {
                let catalogId = item.catalog_id;

                // If no catalog ID is provided but we have a title, try to find or create it
                if (!catalogId && item.title) {
                    // Check if exists (case insensitive?) - For now exact match on title + tenant
                    // We need to import TreatmentCatalog model here or use repository
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
                        // Create new catalog entry
                        const newCatalog = await TreatmentCatalog.create({
                            tenant_id: tenantId,
                            title: item.title,
                            description: item.description, // Default description from item
                            color: item.color || 'blue' // Default color
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
            }));

            const planData = {
                ...data,
                tenant_id: tenantId,
                patient_id: patientId,
                items: processedItems
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
