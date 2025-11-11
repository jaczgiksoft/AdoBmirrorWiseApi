// src/models/mysql/departmentStore.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DepartmentStore = sequelize.define('DepartmentStore', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    department_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },

    // 🔹 Margen local del departamento en esta tienda
    profit_margin_override: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Margen de ganancia específico del departamento en esta tienda'
    },

    use_parent_profit_margin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si es true, usa el margen del department global o tenant'
    },
}, {
    tableName: 'department_stores',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = DepartmentStore;
