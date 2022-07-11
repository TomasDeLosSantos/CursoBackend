// const fs = require('fs');
const express = require('express');
const { Router } = express;
const app = express();
const router = Router();
const PORT = 8080;

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


app.get('/', (req, res) => {
    res.redirect('/api');
})

router.get('/', (req, res) => {
    res.render('./pages/index', {message: ''});
})

router.get('/productos', (req, res) => {
    res.render('./pages/products', {products: products});
})

router.get('/productos/:id', (req, res) => {
    let book = products.find(p => p.id == req.params.id);
    book ? res.json(book) : res.json({ error: "Not Found"});
})

router.post('/productos', (req, res) => {
    let { title, price, img } = req.body;
    let newBook = {title: title, price: price, img: img, id: products.length+1};
    products.push(newBook);
    res.render('./pages/alert', {message: 'Product added successfully!'});
})

router.put('/productos/:id', (req, res) => {
    let { title, price, url } = req.body;
    let book = products.find(p => p.id == req.params.id);

    if(book){
        book.title = title;
        book.price = price;
        book.url = url;
    
        products[products.findIndex(p => p.id == req.params.id)] = book;
        
        res.render('./pages/alert', {message: 'Product updated successfully!'});
    } else{
        res.render('./pages/alert', {message: 'Error: product not found'});
    }
})

router.delete('/productos/:id', (req, res) => {
    let book = products.find(p => p.id == req.params.id);

    if(book){
        products = products.filter(p => p.id != req.params.id);
        res.send({ deleted: book });
    } else{
        res.send({ error: "Not Found" });
    }
})

const server = app.listen(PORT, () => {
    console.log(`Corriendo servidor en dirección ${PORT}`);
})

server.on("error", error => console.log(`Error en el servidor ${error}`));