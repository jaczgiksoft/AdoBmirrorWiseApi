const sequelize = require('../../config/database');
const budgetRepository = require('./budget.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class BudgetService {

    // 🧠 Lógica Financiera Central
    calculateFinancials(data, items) {
        // 1. Total (sum(quantity * unit_price))
        let total = items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unit_price) || 0;
            return sum + (qty * price);
        }, 0);

        // 2. Descuentos
        let discountAmount = 0;
        const discountVal = parseFloat(data.discount_value) || 0;
        if (data.discount_type === 'percentage') {
            discountAmount = total * (discountVal / 100);
        } else { // fixed
            discountAmount = discountVal;
        }

        // 3. Anticipo (Down Payment)
        let downPaymentAmount = 0;
        const dpVal = parseFloat(data.down_payment_value) || 0;
        if (data.down_payment_type === 'percentage') {
            downPaymentAmount = total * (dpVal / 100);
        } else { // fixed
            downPaymentAmount = dpVal;
        }

        // Validaciones de negocio
        if (discountAmount + downPaymentAmount > total) {
            throw new Error('El descuento más el anticipo no pueden superar el total.');
        }

        // 4. Subtotal (Restante a financiar)
        let subtotal = total - discountAmount - downPaymentAmount;
        if (subtotal < 0) subtotal = 0;

        // 5. Mensualidad
        let monthlyPayment = 0;
        const duration = parseInt(data.duration_months) || 1;

        if (subtotal > 0) {
            if (duration <= 0) throw new Error('La duración debe ser mayor a 0 si hay saldo pendiente.');
            monthlyPayment = subtotal / duration;
        }

        return {
            total: parseFloat(total.toFixed(2)),
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            down_payment_amount: parseFloat(downPaymentAmount.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            monthly_payment: parseFloat(monthlyPayment.toFixed(2)),

            // Retorno valores limpios también
            discount_type: data.discount_type || null,
            discount_value: parseFloat(discountVal.toFixed(2)),
            down_payment_type: data.down_payment_type || null,
            down_payment_value: parseFloat(dpVal.toFixed(2)),
            duration_months: duration
        };
    }

    // 🟢 Crear Presupuesto
    async createBudget(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            // Calcular items (preparar array)
            const items = data.items || [];

            // Recalcular items total_price individualmente
            const processedItems = items.map(item => ({
                ...item,
                total_price: (item.quantity || 0) * (item.unit_price || 0)
            }));

            // Calcular financieras
            const financials = this.calculateFinancials(data, processedItems);

            const budgetData = {
                ...data,
                ...financials,
                tenant_id: currentUser.tenant_id,
                created_by: currentUser.id,
                status: 'pending' // Default incial
            };

            const newBudget = await budgetRepository.createBudget(budgetData, processedItems, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'budgets',
                description: `Presupuesto creado: ${newBudget.title} ($${newBudget.total})`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newBudget;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear presupuesto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar Presupuesto
    async updateBudget(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const budget = await budgetRepository.findById(id, currentUser.tenant_id);
            if (!budget) throw new Error('Presupuesto no encontrado');

            // Items: Si se envían items, se reemplazan. Si no, se asume que no cambian (o se maneja lógica parcial, pero aquí reemplazaremos para consistencia con frontend)
            const items = data.items ? data.items : (budget.items || []);

            // Recalcular items total_price
            const processedItems = items.map(item => ({
                ...item,
                total_price: (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
            }));

            // Calcular financieras
            const financials = this.calculateFinancials(data, processedItems);

            const updateData = {
                title: data.title,
                status: data.status,
                treatment_plan_id: data.treatment_plan_id,
                start_date: data.start_date,
                notes: data.notes,
                ...financials
            };

            // Update Header
            await budgetRepository.updateBudget(budget, updateData, t);

            // Replace Items if provided
            if (data.items) {
                await budgetRepository.replaceItems(id, processedItems, t);
            }

            await t.commit();

            // Fetch fresh
            const updatedBudget = await budgetRepository.findById(id, currentUser.tenant_id);

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'budgets',
                description: `Presupuesto actualizado: ${updatedBudget.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return updatedBudget;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar presupuesto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar Presupuesto
    async deleteBudget(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const budget = await budgetRepository.findById(id, currentUser.tenant_id);
            if (!budget) throw new Error('Presupuesto no encontrado');

            await budgetRepository.deleteBudget(budget, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'budgets',
                description: `Presupuesto eliminado: ${budget.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar presupuesto: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener por Paciente
    async getBudgetsByPatient(patientId, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');
        return budgetRepository.findAllByPatient(patientId, currentUser.tenant_id);
    }
}

module.exports = new BudgetService();
