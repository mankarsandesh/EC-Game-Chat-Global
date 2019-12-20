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

module.exports = {
    connectDB
}
 
