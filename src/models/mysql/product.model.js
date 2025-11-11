// src/models/mysql/product.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // 🔑 Identificación
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código interno o SKU único del producto',
    },
    barcode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Código de barras, puede compartirse entre tiendas',
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // 📂 Clasificación
    department_store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Departamento asociado a una tienda específica (DepartmentStore.id)',
    },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    brand_id: { type: DataTypes.INTEGER, allowNull: true },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    tax_id: { type: DataTypes.INTEGER, allowNull: true },

    // 💲 Configuración de precios
    profit_margin: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Porcentaje de ganancia específico del producto. Si es null, hereda del nivel superior.',
    },
    promo_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Precio promocional global del producto. Tiene prioridad sobre el margen.',
    },
    is_tax_included: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Define si los precios incluyen impuestos.',
    },

    // ⚙️ Configuración de unidades y presentación
    stock_control: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Define si el producto controla inventario (servicios no lo hacen).',
    },

    // 🧱 Configuración de empaques
    is_pack: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el producto se compra en paquetes (charola, caja, costal, etc.).',
    },
    units_per_pack: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        comment: 'Cantidad de unidades contenidas por paquete. Puede representar piezas, kg o litros.',
    },

    // ⚖️ Configuración para productos a granel
    is_bulk: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el producto se vende a granel (por peso, volumen o medida fraccional).',
    },
    unit_base_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Unidad base de venta (ej. pieza, kg, L).',
    },
    unit_purchase_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Unidad de compra (ej. costal, caja, charola).',
    },

    // 🧩 Configuración adicional POS
    is_kit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el producto es un conjunto de otros productos (combo).',
    },
    has_variants: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el producto tiene variantes (colores, tallas, etc.).',
    },

    // 🔐 Estado
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    tableName: 'products',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'] },
        { fields: ['status'] },
        { fields: ['category_id'] },
        { fields: ['sku'] },
        { fields: ['barcode'] },
    ],
});

module.exports = Product;
