const { QueryTypes } = require('sequelize');
const sequelize = require('../db/db');


//check if a user exists in the database
async function isUser (id) {
    try {
        const query = `SELECT * FROM users WHERE userId = "${id}"`;
        const user = await sequelize.query(query, { type: QueryTypes.SELECT });
        return user;
    } catch (error) {
        console.log(error);
        throw new Error();
    }
}

//Save Message in the DB
async function saveMessage (userId, userName, userMessage) {
    try {
        const query = `INSERT INTO chat(userId,userName,userMessage) VALUES("${userId}","${userName}","${userMessage}")`;
        await sequelize.query(query, { type: QueryTypes.INSERT });
    } catch (error) {
        console.log(error);
        throw new Error();
    }
}

//Fetch all messages of global chat
async function getAllMessages () {
    try {
        const query = `SELECT * FROM chat where chatType=0`;
        const data = await sequelize.query(query, { type: QueryTypes.SELECT });
        const messages = formatMessage(data);
        return messages;
    } catch (error) {
        console.log('Unable to fetch messages');
    }
}

//Format message
function formatMessage(messages) {
    let temp = [];
    console.log(messages);
    for(let i=0; i<messages.length; i++) {
        let message = {
            userId: messages[i].userId,
            name: messages[i].userName,
            message: messages[i].userMessage
        };
        temp.push(message);
    }
    return {status: true, data: temp};
}

module.exports = {
    isUser,
    saveMessage,
    getAllMessages
}
