const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const EmployeeChat = sequelize.define('EmployeeChat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('private', 'group'),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'employee_chats',
    timestamps: true,
    underscored: true
});

module.exports = EmployeeChat;
