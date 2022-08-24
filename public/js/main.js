const socket = io.connect();
const productForm = document.getElementById("product__form");
const chatForm = document.getElementById("chat__form");
const chatCont = document.getElementById("chat__cont");

productForm.addEventListener('submit', e => {
    e.preventDefault();

    const newProduct = {
        title: productForm[0].value,
        price: productForm[1].value,
        img: productForm[2].value
    }
    socket.emit('update', newProduct);

    productForm.reset();
})

const showProducts = async (products) => {
    try {
        const response = await fetch('./templates/product.hbs')
        const data = await response.text();
        const template = Handlebars.compile(data);
        const html = template({ products });
        return html;
    } catch (error) {
        console.error(error);
    }
}

// MUESTRO PRODUCTOS DESDE PROCTS-TEST EN LUGAR DE LOS RECIBIDOS A TRAVÉS DE WEB SOCKETS
// socket.on('products', products => {
//     showProducts(products)
//         .then(html => {
//             document.getElementById("product__cont").innerHTML = html;
//         })
// })

fetch('/api/products-test')
    .then(response => response.json())
    .then(data => {
        showProducts(data)
            .then(html => {
                document.getElementById("product__cont").innerHTML = html;
            })
    })
    .catch(err => console.error(err))

chatForm.addEventListener('submit', e => {
    e.preventDefault();

    const newMessage = { 
        author: { 
            id: chatForm[0].value,
            name: chatForm[1].value,
            lastname: chatForm[2].value,
            age: chatForm[3].value,
            nick: chatForm[4].value,
            avatar: chatForm[5].value
        }, 
        text: chatForm[6].value 
    };

    socket.emit('newMessage', newMessage);
    chatForm.reset();
})


const author = new normalizr.schema.Entity('author', {});
const message = new normalizr.schema.Entity('message', {
    author: author
})
const messages = new normalizr.schema.Entity('messages', {
    author: author,
    messages: [message]
})

socket.on('messages', msgs => {
    if(msgs){
        let denormalizedData = normalizr.denormalize(msgs[0].result, messages, msgs[0].entities);
        showMessages(denormalizedData.messages);
    }
})

const showMessages = messages => {
    chatCont.innerHTML = '';
    for(let m of messages){
        let msgCont = document.createElement("h3");
        msgCont.classList.add("msg__cont");
        msgCont.textContent = m.author.id;

        let msgDate = document.createElement("span");
        msgDate.classList.add("msg__date");
        msgDate.textContent = '[' + m.author.name + ' ' + m.author.lastname + ']: ';
        msgCont.appendChild(msgDate);

        let msgText = document.createElement("i");
        msgText.classList.add("msg__text");
        msgText.textContent = m.text;
        msgCont.appendChild(msgText);

        chatCont.appendChild(msgCont);
    }
}