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
async function saveMessage (userId, userMessage) {
    try {
        const query = `INSERT INTO chat(chatType,userId,userMessage) VALUES(2,"${userId}","${userMessage}")`;
        await db.execute(query);
    } catch (error) {
        console.log('Unable to insert messages in the database');
    }
}

async function getAllMessages () {
    try {
        const query = `SELECT * FROM chat`;
        const messages = await db.execute(query);
        console.log(messages[0]);
        return messages[0.
        ];
    } catch (error) {
        console.log('Unable to fetch messages');
    }
}

module.exports = {
    isUser,
    saveMessage,
    getAllMessages
}
