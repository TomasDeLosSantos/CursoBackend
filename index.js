const express = require('express');
const { Router } = express;
const app = express();
const router = Router();
const PORT = 8000;
const { Server: HttpServer} = require('http');
const { Server: Socket} = require('socket.io');
const { faker } = require('@faker-js/faker')
const { vehicle, image, mersenne } = faker;
faker.locale = 'es';
const normalizr = require('normalizr');
const { normalize, denormalize, schema} = normalizr;
const compression = require('compression');

// MONGO MESSAGES
const Mongo = require('./services/MongoDB');
const mongo = new Mongo();

// MONGO USERS
const MongoUsers = require('./services/MongoUsers');
const mongoUsers = new MongoUsers();
module.exports = mongoUsers;

const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);
const { authRouter } = require('./routers/auth');
const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');



require('dotenv').config();

const graphSchema = buildSchema(`
    type Product {
        title: String,
        price: Int,
        img: String
    }
    type Query {
        getRandomProducts(): [Product]
    }
`)

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

const getRandomProducts = () => {
    return mockProducts();
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

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser(async (username, done) => {
    let user = await mongoUsers.getByUsername(username);
    done(null, user)
})

app.use(express.json());
app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);
app.use(compression());
app.set('view engine', 'ejs');


app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 30000
    }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRouter);

app.use('/graphql', graphqlHTTP({
    schema: graphSchema,
    rootValue: {
        getRandomProducts
    },
    graphiql: false
}));

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

app.get('/info', (req, res) => {
    res.json({
        ...args,
        platform: process.platform,
        version: process.version,
        memory: process.memoryUsage(),
        processID: process.pid,
        folder: process.cwd()
    })
})


const server = httpServer.listen(process.env.PORT || PORT, () => {
    console.log(`Corriendo servidor en dirección ${PORT}`);
})
