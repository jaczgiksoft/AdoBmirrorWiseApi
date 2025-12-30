const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ClinicArea = sequelize.define(
    'ClinicArea',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        tenant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
            defaultValue: 'active',
            allowNull: false,
        },
    },
    {
        tableName: 'clinic_areas',
        timestamps: true,
        paranoid: true, // Soft delete
        underscored: true,
    }
);

module.exports = ClinicArea;
