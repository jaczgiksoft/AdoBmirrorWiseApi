const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ChatMessageRead = sequelize.define('ChatMessageRead', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'chat_messages_read',
    timestamps: true,
    underscored: true
});

module.exports = ChatMessageRead;
