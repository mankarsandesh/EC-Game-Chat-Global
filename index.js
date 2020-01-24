const app = require('express')();
const http = require('http').Server(app);
// Load all env variables
require('dotenv').config();
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const cleanMessage = require('./filters/filters');
const {isUser, saveMessage, getAllMessages} = require('./controller/controller');

// Connect DB
require('./db/db');

const PORT = process.env.PORT || 5000;
const users = [];

//bodyparser middleware
app.use(bodyParser.json());

//setting headers middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

//CORS configuration
const corsOptions = {
    origin: '*',
    withCredentials: true
};
//CORS middleware
app.use(cors(corsOptions));

app.get('/chat/:id', async (req, res) => {
    try {
        userId = req.params.id;
        //Check if a user exist
        const user = await isUser(userId);
        if(!user) {
            res.status(404).send('User does not exist');
        } else {
            res.sendFile(__dirname + '/index.html');
        } 
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
});

app.get('/allmessages', async (req, res) => {
    try {
        const messages = await getAllMessages();
        console.log(messages.data);
        if(!messages.data[0]) {
            res.status(404).send('No messages found')
        } else {
            res.status(200).send(messages);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
});

http.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});

// Initiate socket listener
const listener = io.listen(http);

// Event listener when client gets connected
listener.sockets.on('connection', (socket) => {
    // const user = await isUser(userId);
    // if(!user[0]) {
    //     socket.disconnect(true);
    //     console.log('disconnected');
    // }
    const userId = socket.handshake.query.userId;

    // Check if user is already present or not
    if(!users.includes(userId)) {
        users.push(userId);
    }
    console.log('Client is connected', userId);
    console.log(`${users.length} users are online`);
    console.log(users);

    // Event emitter for users count
    io.emit('user-count-global', (users.length));

    // Event listener when client gets disconnected
    socket.on('disconnect', () => {
        // find the index of user in the users array
        const index = users.findIndex(user => user === userId);
        // Remove the user from the users array 
        users.splice(index, 1);

        // Event emitter when user successfully gets disconnected
        io.emit('chat-global', `${userId} is disconnected`);
        console.log(`Client ${userId} is disconnected`);
        console.log(`${users.length} users are online`);
        console.log(users);

        // After user got successfully disconnected all clients will know how many users are online.... Event emitter for users count
        io.emit('user-count-global', (users.length));
    });

    // Event emitter when client gets connected
    io.emit('chat-global', `Client ${userId} is connected`);

    // Event listener when client sends new message
    socket.on('send-message-global', (data) => {
        // Check the message if it contains any bad or abusive words (Also checks if phone number is present in the message)
        data.message = cleanMessage(data.message);

        // Event emitter for sending messages to all clients
        io.emit('new-message-global', data);
        
        // Save message in the database
        saveMessage(data.userId, data.name, data.message).then((data) => {
            console.log('message saved');
        }).catch(error => console.log(error));
    });
});
