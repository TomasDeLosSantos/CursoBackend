const express = require('express');
const { Router } = express;
const { Server: HttpServer} = require('http');
const { Server: Socket} = require('socket.io');

const app = express();
const router = Router();
const PORT = 8000;
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const dbManager = require('./modules/dbManager');

const sqlite = new dbManager({
    client: 'sqlite3',
    connection: {
        filename: './DB/messages.sqlite'
    },
    useNullAsDefault: true
}, 'message');

const mariaDB = new dbManager({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: '',
        database: 'products'
    }
}, 'product');

app.use(express.json());
app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);
app.set('view engine', 'ejs');

// WEBSOCKETS
io.on('connection', async socket => {
    console.log('New client connected');

    // PRODUCTS
    socket.emit('products', await mariaDB.getAll());

    socket.on('update', async product => {
        await mariaDB.save(product)
        io.sockets.emit('products', await mariaDB.getAll());
    })

    //MESSAGES
    socket.emit('messages', await sqlite.getAll());

    socket.on('newMessage', async msg => {
        msg.date = new Date().toLocaleString()
        await sqlite.save(msg)
        io.sockets.emit('messages', await sqlite.getAll());
    })
})

const server = httpServer.listen(PORT, () => {
    console.log(`Corriendo servidor en dirección ${PORT}`);
})

server.on("error", error => console.log(`Error en el servidor ${error}`));