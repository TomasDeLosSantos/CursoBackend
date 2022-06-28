const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 8080;


class Contenedor{
    constructor(url){
        this.url = url;
    }

    async save(obj){
        try {
            const data = JSON.parse(await fs.promises.readFile(this.url, 'utf-8'));
            obj.id = data.length + 1;
            data.push(obj);
            await fs.promises.writeFile(this.url, JSON.stringify(data, null, 2));
            console.log(obj.id);
            return obj.id;
        } catch (error) {
            console.log(error);
        }
    }

    async getById(id){
        try {
            const data = JSON.parse(await fs.promises.readFile(this.url, 'utf-8'));
            console.log(data.find(p => p.id === id));
            // return data.find(p => p.id === id);
        } catch (error) {
            console.log(error);
        }
    }

    async getAll(){
        try {
            const data = JSON.parse(await fs.promises.readFile(this.url, 'utf-8'));
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async deleteById(id){
        try {
            let data = JSON.parse(await fs.promises.readFile(this.url, 'utf-8'));
            data = data.filter(p => p.id !== id);
            await fs.promises.writeFile(this.url, JSON.stringify(data, null, 2));
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    async deleteAll(){
        try {
            await fs.promises.writeFile(this.url, JSON.stringify([], null, 2));
            console.log(JSON.parse(await fs.promises.readFile(this.url, 'utf-8')));
        } catch (error) {
            console.log(error);
        }
    }
}

const test1 = new Contenedor('test1.txt');

app.get('/', (req, res) => {
    res.send("<h1 style='color: blue;'>Bienvenidos al servidor con Express</h1>")
})

app.get('/productos', (req, res) => {
    test1.getAll().then(data => {
        res.send(data);
    })
})

app.get('/productoRandom', (req, res) => {
    test1.getAll().then(data => {
        res.send(data[Math.floor(Math.random() * data.length)]);
    })
})

const server = app.listen(PORT, () => {
    console.log(`Corriendo servidor en dirección ${PORT}`);
})

server.on("error", error => console.log(`Error en el servidor ${error}`));