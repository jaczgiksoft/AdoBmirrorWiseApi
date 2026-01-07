const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Step = sequelize.define(
    'Step',
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 15,
        },
    },
    {
        tableName: 'steps',
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = Step;
