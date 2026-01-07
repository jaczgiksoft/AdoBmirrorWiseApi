const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProcessStep = sequelize.define(
    'ProcessStep',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        process_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        step_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        duration_override: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: 'process_steps',
        timestamps: true,
        paranoid: false,
        underscored: true,
    }
);

module.exports = ProcessStep;
