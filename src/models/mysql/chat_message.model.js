const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('text'),
        defaultValue: 'text',
        allowNull: false
    }
}, {
    tableName: 'chat_messages',
    timestamps: true,
    underscored: true
});

module.exports = ChatMessage;
