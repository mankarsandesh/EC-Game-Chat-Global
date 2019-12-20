const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const {isUser, saveMessage, getAllMessages} = require('./controller/controller');

const PORT = process.env.PORT || 5000;
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
        if(!user[0]) {
            res.send('User does not exist').status(404);
        } else {
            res.sendFile(__dirname + '/index.html');
        } 
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.get('/allmessages', async (req, res) => {
    try {
        const messages = await getAllMessages();
        if(!messages[0]) {
            res.status(404).send('No messages found')
        } else {
            res.status(200).send(messages);
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

http.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});

//Inititate socket listener
const listener = io.listen(http);
listener.sockets.on('connection', (socket) => {
    // const user = await isUser(userId);
    // if(!user[0]) {
    //     socket.disconnect(true);
    //     console.log('disconnected');
    // }
    const userId = socket.handshake.query.userId;
    console.log('Client is connected', userId);
    io.emit('chat-global', `Client ${userId} is connected`);
    socket.on('send-message', (data) => {
        //Event emitter for sending messages to all clients
        io.emit('new-message', data);
        //Save message in the database
        saveMessage(data.userId,data.name, data.message).then((data) => {
            console.log('message saved');
        }).catch(error => console.log(error));
    });
});
