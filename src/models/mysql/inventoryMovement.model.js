// src/models/mysql/inventoryMovement.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🔹 Referencias principales
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: true },

    // 🔹 Tipo de movimiento
    type: {
        type: DataTypes.ENUM('in', 'out', 'adjustment'),
        allowNull: false
    },

    // 🔹 Datos de stock
    quantity: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    previous_stock: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    new_stock: { type: DataTypes.DECIMAL(12,2), allowNull: false },

    // 🔹 Motivo
    reason: {
        type: DataTypes.ENUM('purchase', 'sale', 'transfer', 'loss', 'manual'),
        allowNull: false
    },
    notes: { type: DataTypes.STRING, allowNull: true },

    // 🔹 Relación con operación origen (polimórfica)
    reference_type: {
        type: DataTypes.STRING, // 'sale', 'purchase', 'return', 'supplier_payment', etc.
        allowNull: true
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

}, {
    tableName: 'inventory_movements',
    timestamps: true,
    paranoid: true,       // Soft delete (deleted_at)
    underscored: true     // snake_case en columnas
});

module.exports = InventoryMovement;
