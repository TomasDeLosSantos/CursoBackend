const express = require('express');
const { Router } = express;
const { Server: HttpServer} = require('http');
const { Server: Socket} = require('socket.io');
const { faker } = require('@faker-js/faker')
const { vehicle, image, mersenne } = faker;
faker.locale = 'es';
const normalizr = require('normalizr');
const { normalize, denormalize, schema} = normalizr;
const Mongo = require('./modules/MongoDB');
const mongo = new Mongo();
const session = require('express-session');
const MongoStore = require('connect-mongo');
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

// GENERADOR DE PRODUCTOS CON FAKER.JS
const mockProducts = () => {
    let array = [];

    for(let i = 0; i < 5; i++){
        array.push({
            title: vehicle.vehicle(),
            price: mersenne.rand(),
            img: image.abstract()
        })
    }

    return array;
}

// NOMALIZACIÓN DE DATOS
const normalizeData = async (msg) => {
    const author = new schema.Entity('author', {});
    const message = new schema.Entity('message', {
        author: author
    })
    const messages = new schema.Entity('messages', {
        author: author,
        messages: [message]
    })
    let mongoMsg = await mongo.getAll();
    let denormalizedData;
    let normalizedData;
    if(mongoMsg[0].result == 0){
        denormalizedData = denormalize(mongoMsg[0].result, messages, mongoMsg[0].entities);
        msg.id = denormalizedData.messages.length;
        denormalizedData.messages.push(msg);
        normalizedData = normalize(denormalizedData, messages);
    } else{
        normalizedData = normalize({id: 0, messages: [{id: 0, author: msg.author, text: msg.text}]}, messages);
    }
    await mongo.update(0, normalizedData);
}


app.use(express.json());
app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);
app.set('view engine', 'ejs');

app.use(session({
    // store: MongoStore.create({ mongoUrl: config.mongoLocal.cnxStr }),
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://tomas:tomasmongo1234@cluster0.zjndnkl.mongodb.net/?retryWrites=true&w=majority' }),
    secret: 'shhhhhhhhhhhhhhhhhhhhh',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 60000
    }
}))

// WEBSOCKETS
io.on('connection', async socket => {
    console.log('New client connected');

    //MESSAGES
    socket.emit('messages', await mongo.getAll());

    socket.on('newMessage', async msg => {
        await normalizeData(msg);
        io.sockets.emit('messages', await mongo.getAll());
    })
})

router.get('/products-test', (req, res) => {
    res.json(mockProducts());
})

/* DESAFÍO COOKIES Y SESSION */
app.get('/logged', (req, res) => {
    if(req.session.username) res.json({login: 1, username: req.session.username});
    else res.json({login: 0});
})

app.post('/login', (req, res) => {
    // console.log(req.body.username);
    req.session.username = req.body.username;
    res.json({login: 1, username: req.body.username});
})

app.get('/logout', (req, res) => {
    let user = req.session.username;
    req.session.destroy(err => {
        if (err) {
            res.json({ login: 0 })
        } else {
            res.json({login: 0, username: user})
        }
    })
})





const server = httpServer.listen(PORT, () => {
    console.log(`Corriendo servidor en dirección ${PORT}`);
})

server.on("error", error => console.log(`Error en el servidor ${error}`));