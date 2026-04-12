const movementRepo = require('./inventory_movement.repository');
const itemRepo = require('../inventory_item/inventory_item.repository');
const sequelize = require('../../config/database');

const registerMovement = async (data, user) => {
    // Requires a transaction: create log + update item balance 
    const t = await sequelize.transaction();
    try {
        const item = await itemRepo.findById(data.item_id, user.tenant_id);
        if (!item) throw new Error('Artículo no encontrado');

        const movementData = { 
            ...data, 
            tenant_id: user.tenant_id,
            user_id: user.id || null
        };

        // Convert quantity to int safely
        const amount = parseInt(data.quantity, 10);
        if (isNaN(amount) || amount === 0) throw new Error('Cantidad inválida');

        // Note: quantity comes signed from frontend (+ for in, - for out) 
        // OR type dictates sign. Let's assume frontend AdjustStock sends positive amount and backend relies on that, OR FE sends signed. Wait, frontend usually sends + for in, - for out. Look at AdjustStockModal.
        // Actually, frontend AdjustStockModal sends positive. 
        // Wait, NO, AdjustStockModal does `amount = type === 'Entrada' ? Math.abs(quantity) : -Math.abs(quantity)`. So amount IS signed.
        
        await movementRepo.create(movementData, t);

        const newStock = parseInt(item.current_stock, 10) + amount;
        if (newStock < 0) {
            throw new Error(`Stock insuficiente. Stock actual es: ${item.current_stock}`);
        }

        // We can also update purchase price if price was sent and it's an Entrada
        const updates = { current_stock: newStock };
        if (data.type === 'Entrada' && data.unit_price) {
            updates.purchase_price = data.unit_price;
        }

        await item.update(updates, { transaction: t });

        await t.commit();
        return { success: true, newStock };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getAllMovements = async (user) => {
    return await movementRepo.findAll(user.tenant_id);
};

module.exports = {
    registerMovement,
    getAllMovements
};
