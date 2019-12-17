const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const {isUser, saveMessage} = require('./db/db');

const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

const corsOptions = {
    origin: '*',
    withCredentials: true
};

app.use(cors(corsOptions));

app.get('/:id', async (req, res) => {
    try {
        userId = req.params.id;
        
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

const listener = io.listen(http);

listener.sockets.on('connection', (socket) => {
    console.log('Client is connected', socket.handshake.query.userId);
    const userId = socket.handshake.query.userId;
    socket.on('send-message', (data) => {
        io.emit('new-message', data);
        saveMessage(userId, data.message).then((data) => {
        }).catch(error => console.log(error));
    });
});
