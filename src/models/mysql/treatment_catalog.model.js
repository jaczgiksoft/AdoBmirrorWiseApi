const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TreatmentCatalog = sequelize.define('TreatmentCatalog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    }
}, {
    tableName: 'treatment_catalogs',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        { fields: ['tenant_id'], name: 'idx_treatment_catalogs_tenant' }
    ]
});

module.exports = TreatmentCatalog;
