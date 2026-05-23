const NotificationCategory = require('../../models/mysql/notification_category.model');
const NotificationTemplate = require('../../models/mysql/notification_template.model');
const { Op } = require('sequelize');

class NotificationCatalogRepository {
    // ==========================================
    // CATEGORIES
    // ==========================================
    async findAllCategories(tenantId) {
        return NotificationCategory.findAll({
            where: {
                [Op.or]: [
                    { tenant_id: tenantId },
                    { tenant_id: null }, // Global system categories
                    { is_system: true }
                ]
            },
            order: [['name', 'ASC']]
        });
    }

    async findCategoryById(id, tenantId) {
        return NotificationCategory.findOne({
            where: {
                id,
                [Op.or]: [
                    { tenant_id: tenantId },
                    { tenant_id: null },
                    { is_system: true }
                ]
            }
        });
    }

    async createCategory(data, transaction) {
        return NotificationCategory.create(data, { transaction });
    }

    async updateCategory(categoryInstance, data, transaction) {
        return categoryInstance.update(data, { transaction });
    }

    async deleteCategory(categoryInstance, transaction) {
        return categoryInstance.destroy({ transaction });
    }

    // ==========================================
    // TEMPLATES
    // ==========================================
    async findAllTemplates(tenantId) {
        return NotificationTemplate.findAll({
            include: [
                {
                    model: NotificationCategory,
                    as: 'category',
                    where: {
                        [Op.or]: [
                            { tenant_id: tenantId },
                            { tenant_id: null },
                            { is_system: true }
                        ]
                    }
                }
            ],
            order: [['code', 'ASC']]
        });
    }

    async findTemplateById(id, tenantId) {
        return NotificationTemplate.findOne({
            where: { id },
            include: [
                {
                    model: NotificationCategory,
                    as: 'category',
                    where: {
                        [Op.or]: [
                            { tenant_id: tenantId },
                            { tenant_id: null },
                            { is_system: true }
                        ]
                    }
                }
            ]
        });
    }

    async findTemplateByCode(code, tenantId) {
        return NotificationTemplate.findOne({
            where: { code },
            include: [
                {
                    model: NotificationCategory,
                    as: 'category',
                    where: {
                        [Op.or]: [
                            { tenant_id: tenantId },
                            { tenant_id: null },
                            { is_system: true }
                        ]
                    }
                }
            ]
        });
    }

    async createTemplate(data, transaction) {
        return NotificationTemplate.create(data, { transaction });
    }

    async updateTemplate(templateInstance, data, transaction) {
        return templateInstance.update(data, { transaction });
    }

    async deleteTemplate(templateInstance, transaction) {
        return templateInstance.destroy({ transaction });
    }
}

module.exports = new NotificationCatalogRepository();
