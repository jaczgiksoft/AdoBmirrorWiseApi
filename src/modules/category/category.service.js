const sequelize = require('../../config/database');
const categoryRepository = require('./category.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class CategoryService {
    async getAllCategories() {
        return categoryRepository.findAll();
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) throw new Error('Categoría no encontrada');
        return category;
    }

    // 🟢 Crear categoría
    async createCategory(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            if (await categoryRepository.findByName(data.name)) {
                throw new Error('El nombre de la categoría ya está en uso');
            }

            const newCategory = await categoryRepository.createCategory(data, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'categories',
                description: `Categoría creada: ${newCategory.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nueva categoría creada',
                message: `${currentUser.username} ha creado la categoría ${newCategory.name}.`,
                type: 'system'
            });

            return newCategory;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear categoría: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar categoría
    async updateCategory(id, data, currentUser, req) {
        const category = await categoryRepository.findById(id);
        if (!category) throw new Error('Categoría no encontrada');

        if (data.name && data.name !== category.name) {
            if (await categoryRepository.findByName(data.name)) {
                throw new Error('Ese nombre ya está en uso');
            }
        }

        await categoryRepository.updateCategory(category, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'categories',
            description: `Categoría actualizada: ${category.name}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        // 🔔 Notificación global
        await notifyUser({
            user_id: currentUser.id,
            tenant_id: currentUser.tenant_id,
            title: 'Categoría actualizada',
            message: `La categoría ${category.name} ha sido actualizada por ${currentUser.username}.`,
            type: 'system'
        });

        return category;
    }

    // 🔴 Eliminar categoría
    async deleteCategory(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const category = await categoryRepository.findById(id);
            if (!category) throw new Error('Categoría no encontrada');

            await categoryRepository.softDeleteCategory(category, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'categories',
                description: `Categoría eliminada: ${category.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Categoría eliminada',
                message: `${currentUser.username} ha eliminado la categoría ${category.name}.`,
                type: 'system'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar categoría: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getCategoriesDatatable(body) {
        const draw   = parseInt(body.draw) || 1;
        const start  = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [
            null,      // contador
            'name',    // 1
            'status',  // 2
            'id'       // 3
        ];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter = body['columns[2][search][value]'] || (body.columns?.[2]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await categoryRepository.datatable(params);

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data: rows
        };
    }
}

module.exports = new CategoryService();
