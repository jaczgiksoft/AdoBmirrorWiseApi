const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const EmployeePosition = sequelize.define('EmployeePosition', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' }
    },
    position_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'positions', key: 'id' }
    }
}, {
    tableName: 'employee_positions',
    timestamps: true,
    underscored: true
});

module.exports = EmployeePosition;
