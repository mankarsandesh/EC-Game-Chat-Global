//Connect DB
async function connectDB() {
    const mysql = require('mysql2/promise');
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stockadmin'
    });
    console.log('Database is conneced');
    return db;
}

let db;
//Initiate DB connection
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
        const query = `INSERT INTO chat(chatType,userId,userMessage) VALUES(2,"${userId}",${userMessage})`;
        await db.execute(query);
    } catch (error) {
        console.log('Unable to insert messages in the database');
    }
}

async function getAllMessages () {
    try {
        const query = `SELECT * FROM chat`;
        const data = await db.execute(query);
        const messages = formatMesasage(data[0]);
        return messages;
    } catch (error) {
        console.log('Unable to fetch messages');
    }
}

//Format message
function formatMesasage(messages) {
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


 
