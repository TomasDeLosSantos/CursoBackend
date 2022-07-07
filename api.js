// const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));


let products = [
    {
        title: "The Way of Kings",
        price: 5000,
        img: '',
        id: 1
    },
    {
        title: "Words of Radiance",
        price: 4500,
        img: '',
        id: 2
    },
    {
        title: "Oathbringer",
        price: 6000,
        img: '',
        id: 3
    }
]

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.get('/api/productos', (req, res) => {
    res.json(products);
})

app.get('/api/productos/:id', (req, res) => {
    let book = products.find(p => p.id == req.params.id);
    book ? res.json(book) : res.json({ error: "Not Found"});
})

app.post('/api/productos', (req, res) => {
    let { title, price, img } = req.body;
    let newBook = {title: title, price: price, img: img, id: products.length+1};
    products.push(newBook);
    res.json({ added: newBook});
})

app.put('/api/productos/:id', (req, res) => {
    let { title, price, url } = req.body;
    let book = products.find(p => p.id == req.params.id);

    if(book){
        book.title = title;
        book.price = price;
        book.url = url;
    
        products[products.findIndex(p => p.id == req.params.id)] = book;
        
        res.json({ updated: book });
    } else{
        res.json({ error: "Not Found" });
    }
})

app.delete('/api/productos/:id', (req, res) => {
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