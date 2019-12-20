const {connectDB} = require('../db/db');

let db;
connectDB().then((data) => {
    db = data;
}).catch(error => console.log(error));

//check if a user exists in the database
async function isUser (id) {
    const query = `SELECT * FROM users WHERE userId = "${id}"`;
    const user = await db.execute(query);
    return user[0];
}

//Save Message in the DB
async function saveMessage (userId, userName, userMessage) {
    try {
        const query = `INSERT INTO chat(userId,userName,userMessage) VALUES("${userId}","${userName}",${db.escape(userMessage)})`;
        await db.execute(query);
    } catch (error) {
        console.log('Unable to insert messages in the database');
    }
}

//Fetch all messages of global chat
async function getAllMessages () {
    try {
        const query = `SELECT * FROM chat where chatType=0`;
        const data = await db.execute(query);
        const messages = formatMessage(data[0]);
        return messages;
    } catch (error) {
        console.log('Unable to fetch messages');
    }
}

//Format message
function formatMessage(messages) {
    let temp = [];
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
