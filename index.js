const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const {isUser, saveMessage} = require('./db/db');

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

app.get('/:id', async (req, res) => {
    try {
        userId = req.params.id;
        //Check if a user exist
        const user = await isUser(userId);
        //console.log(user);
        if(!user) {
            res.send('User does not exist').status(404);
        }    
        res.sendFile(__dirname + '/index.html');
    } catch (error) {
        res.send().status(500);
    }
});

http.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});

//Inititate socket listener
const listener = io.listen(http);

listener.sockets.on('connection', (socket) => {
    console.log('Client is connected', socket.handshake.query.userId);
    //fetch username and userid from query parameters
    const userId = socket.handshake.query.userId;
    const name = socket.handshake.query.name;
    //event listener on receiving message from client
    socket.on('send-message', (data) => {
        //Event emitter for sending messages to all clients
        io.emit('new-message', ({
            message: data.message,
            name: data.name
        }));
        //Save message in the database
        saveMessage(userId, data.message).then((data) => {
            console.log('message saved');
        }).catch(error => console.log(error));
    });
});
