const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Process = sequelize.define(
    'Process',
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
    },
    {
        tableName: 'processes',
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = Process;
