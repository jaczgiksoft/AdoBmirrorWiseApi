const { Op } = require('sequelize');
const Budget = require('../../models/mysql/budget.model');
const BudgetItem = require('../../models/mysql/budget_item.model');

class BudgetRepository {
    // 🟢 Crear Presupuesto con Items (Transaccionado)
    async createBudget(budgetData, itemsData, transaction) {
        const budget = await Budget.create(budgetData, { transaction });

        if (itemsData && itemsData.length > 0) {
            const itemsWithId = itemsData.map(item => ({
                ...item,
                budget_id: budget.id
            }));
            await BudgetItem.bulkCreate(itemsWithId, { transaction });
        }

        return this.findById(budget.id, budgetData.tenant_id, transaction);
    }

    // 🟡 Actualizar Presupuesto (Header)
    async updateBudget(budget, data, transaction) {
        return budget.update(data, { transaction });
    }

    // 🟡 Reemplazar Items (Borrar y Crear nuevos)
    async replaceItems(budgetId, newItems, transaction) {
        // 1. Eliminar items existentes
        await BudgetItem.destroy({
            where: { budget_id: budgetId },
            transaction
        });

        // 2. Crear nuevos items
        if (newItems && newItems.length > 0) {
            const itemsWithId = newItems.map(item => ({
                ...item,
                budget_id: budgetId
            }));
            await BudgetItem.bulkCreate(itemsWithId, { transaction });
        }
    }

    // 🔴 Eliminar Presupuesto
    async deleteBudget(budget, transaction) {
        // Items se borran por CASCADE en DB, pero models paranoid requieren lógica si es soft delete
        // Si usas soft delete en items, deberías borrarlos aquí también si no tienes cascade hooks habilitado
        // Por ahora confiamos en el cascade DB o borrado explícito si es soft delete
        await BudgetItem.destroy({ where: { budget_id: budget.id }, transaction });
        return budget.destroy({ transaction });
    }

    // 🔍 Buscar por ID y tenant (Include Items)
    async findById(id, tenantId, transaction = null) {
        const options = {
            where: { id, tenant_id: tenantId },
            include: [
                { model: BudgetItem, as: 'items' }
            ]
        };
        if (transaction) options.transaction = transaction;

        return Budget.findOne(options);
    }

    // 📋 Listar por Paciente
    async findAllByPatient(patientId, tenantId) {
        return Budget.findAll({
            where: {
                tenant_id: tenantId,
                patient_id: patientId
            },
            include: [
                { model: BudgetItem, as: 'items' }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    // 📊 Datatable (opcional, si se requiere listado general)
    // Implementar similar a service.repository si es necesario
}

module.exports = new BudgetRepository();
