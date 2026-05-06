const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const EmployeeChatParticipant = sequelize.define('EmployeeChatParticipant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member',
        allowNull: false
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    left_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
    }
}, {
    tableName: 'employee_chat_participants',
    timestamps: true,
    underscored: true
});

module.exports = EmployeeChatParticipant;
