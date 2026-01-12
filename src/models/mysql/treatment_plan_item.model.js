const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TreatmentPlanItem = sequelize.define('TreatmentPlanItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    treatment_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'treatment_plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    catalog_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'treatment_catalogs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },

    title: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'treatment_plan_items',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_treatment_plan_items_tenant' },
        { fields: ['treatment_plan_id'], name: 'idx_treatment_plan_items_plan' }
    ]
});

module.exports = TreatmentPlanItem;
