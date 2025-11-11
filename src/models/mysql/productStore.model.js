// src/models/mysql/productStore.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProductStore = sequelize.define('ProductStore', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🧩 Relaciones base
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },

    // 🧮 Inventario
    stock: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        comment: 'Stock actual en unidades base del producto (pieza, kg, L, etc.)',
    },
    stock_min: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    stock_max: { type: DataTypes.DECIMAL(12, 2), allowNull: true },

    // 📦 Unidad base del inventario
    stock_unit_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Unidad base en la que se mide el stock (ej. pieza, kg, L)',
    },

    // 🛒 Información de último ingreso
    cost_last_purchase: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Costo unitario del último ingreso de inventario para este producto en esta tienda',
    },
    last_restock_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha del último ingreso de inventario para este producto en esta tienda',
    },

    // 🔁 Reabastecimiento
    reorder_point: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Nivel mínimo de stock que activa reabastecimiento automático',
    },
    reorder_qty: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Cantidad sugerida para reabastecer',
    },

    // 💰 Overrides de precios
    wholesale_price_override: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Precio mayorista local',
    },
    wholesale_min_qty_override: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Cantidad mínima para aplicar precio mayorista local',
    },
    promo_price_override: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Precio promocional temporal en esta tienda (tiene prioridad sobre el margen)',
    },

    // 📊 Overrides de ganancia e impuestos
    profit_margin_override: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Margen de ganancia específico del producto en esta tienda (%)',
    },
    tax_id_override: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Impuesto personalizado para esta tienda (si aplica)',
    },

    // 🖥️ Visibilidad POS
    visible_in_pos: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Define si el producto es visible en el punto de venta',
    },

    // 🔐 Estado
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    tableName: 'product_stores',
    timestamps: true,
    paranoid: true,
    underscored: true,

    indexes: [
        // 🔹 Evita duplicar el mismo producto en la misma tienda
        { unique: true, fields: ['product_id', 'store_id'], name: 'product_store_unique_idx' },

        // 🔹 Para búsquedas rápidas
        { fields: ['tenant_id'] },
        { fields: ['store_id'] },
        { fields: ['status'] },
    ],
});

module.exports = ProductStore;
