const notificationCatalogRepository = require('./notification_catalog.repository');
const sequelize = require('../../config/database');

class NotificationCatalogService {
    // ==========================================
    // CATEGORIES
    // ==========================================
    async getAllCategories(tenantId) {
        return notificationCatalogRepository.findAllCategories(tenantId);
    }

    async getCategoryById(id, tenantId) {
        const category = await notificationCatalogRepository.findCategoryById(id, tenantId);
        if (!category) {
            throw new Error('Categoría de notificación no encontrada');
        }
        return category;
    }

    async createCategory(data, tenantId) {
        const payload = {
            ...data,
            tenant_id: tenantId,
            is_system: false // Solo las del sistema creadas por migraciones/seeders son is_system = true
        };

        const t = await sequelize.transaction();
        try {
            const category = await notificationCatalogRepository.createCategory(payload, t);
            await t.commit();
            return category;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async updateCategory(id, data, tenantId) {
        const category = await this.getCategoryById(id, tenantId);
        if (category.is_system && !data.bypassSystemCheck) {
            throw new Error('No se pueden modificar categorías del sistema');
        }

        const allowedFields = ['name', 'icon', 'color', 'is_active'];
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        const t = await sequelize.transaction();
        try {
            const updated = await notificationCatalogRepository.updateCategory(category, cleanData, t);
            await t.commit();
            return updated;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async deleteCategory(id, tenantId) {
        const category = await this.getCategoryById(id, tenantId);
        if (category.is_system) {
            throw new Error('No se pueden eliminar categorías del sistema');
        }

        const t = await sequelize.transaction();
        try {
            await notificationCatalogRepository.deleteCategory(category, t);
            await t.commit();
            return { message: 'Categoría eliminada correctamente' };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    // ==========================================
    // TEMPLATES
    // ==========================================
    async getAllTemplates(tenantId) {
        return notificationCatalogRepository.findAllTemplates(tenantId);
    }

    async getTemplateById(id, tenantId) {
        const template = await notificationCatalogRepository.findTemplateById(id, tenantId);
        if (!template) {
            throw new Error('Plantilla de notificación no encontrada');
        }
        return template;
    }

    async getTemplateByCode(code, tenantId) {
        const template = await notificationCatalogRepository.findTemplateByCode(code, tenantId);
        if (!template) {
            throw new Error('Plantilla de notificación no encontrada por código');
        }
        return template;
    }

    async createTemplate(data, tenantId) {
        // Validar que la categoría asociada sea válida para este tenant
        const category = await this.getCategoryById(data.category_id, tenantId);
        if (!category) {
            throw new Error('La categoría especificada no es válida');
        }

        // Validar código duplicado
        const existing = await notificationCatalogRepository.findTemplateByCode(data.code, tenantId);
        if (existing) {
            throw new Error('El código de la plantilla ya está registrado');
        }

        const t = await sequelize.transaction();
        try {
            const template = await notificationCatalogRepository.createTemplate(data, t);
            await t.commit();
            return template;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async updateTemplate(id, data, tenantId) {
        const template = await this.getTemplateById(id, tenantId);

        if (data.category_id) {
            const category = await this.getCategoryById(data.category_id, tenantId);
            if (!category) {
                throw new Error('La categoría especificada no es válida');
            }
        }

        if (data.code && data.code !== template.code) {
            const existing = await notificationCatalogRepository.findTemplateByCode(data.code, tenantId);
            if (existing) {
                throw new Error('El código de la plantilla ya está registrado');
            }
        }

        const allowedFields = [
            'category_id',
            'code',
            'title_template',
            'message_template',
            'language',
            'allowed_placeholders'
        ];
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        const t = await sequelize.transaction();
        try {
            const updated = await notificationCatalogRepository.updateTemplate(template, cleanData, t);
            await t.commit();
            return updated;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async deleteTemplate(id, tenantId) {
        const template = await this.getTemplateById(id, tenantId);

        const t = await sequelize.transaction();
        try {
            await notificationCatalogRepository.deleteTemplate(template, t);
            await t.commit();
            return { message: 'Plantilla eliminada correctamente' };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

module.exports = new NotificationCatalogService();
