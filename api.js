// const fs = require('fs');
const express = require('express');
const { Router } = express;
const { Server: HttpServer} = require('http');
const { Server: Socket} = require('socket.io');
const files = require('./modules/files.js');

const app = express();
const router = Router();
const PORT = 8000;
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const messagesDB = new files('messages.txt');


app.use(express.json());
app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);
app.set('view engine', 'ejs');


let products = [
    {
        title: "The Way of Kings",
        price: 5000,
        img: 'https://images.cdn3.buscalibre.com/fit-in/360x360/d6/bb/d6bbbdb2b931fd59f095cf37435ed6e3.jpg',
        id: 1
    },
    {
        title: "Foundation",
        price: 4500,
        img: 'https://images.cdn2.buscalibre.com/fit-in/360x360/e3/77/e37775bdc1602f5952818c6c52cc6c8a.jpg',
        id: 2
    },
    {
        title: "Dune",
        price: 6000,
        img: 'https://images.cdn1.buscalibre.com/fit-in/360x360/bb/1f/bb1f2daa9d7fdb7bc9caf1006b329ca5.jpg',
        id: 3
    }
]


// WEBSOCKETS
io.on('connection', async socket => {
    console.log('New client connected');

    // PRODUCTS
    socket.emit('products', products);

    socket.on('update', product => {
        products.push(product);
        io.sockets.emit('products', products);
    })

    //MESSAGES
    socket.emit('messages', await messagesDB.getAll());

    socket.on('newMessage', async msg => {
        msg.date = new Date().toLocaleString()
        await messagesDB.save(msg)
        io.sockets.emit('messages', await messagesDB.getAll());
    })
})





const server = httpServer.listen(PORT, () => {
    console.log(`Corriendo servidor en dirección ${PORT}`);
})

server.on("error", error => console.log(`Error en el servidor ${error}`));