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

socket.on('products', products => {
    showProducts(products)
        .then(html => {
            document.getElementById("product__cont").innerHTML = html;
        })
})

chatForm.addEventListener('submit', e => {
    e.preventDefault();

    const newMessage = { 
        author: chatForm[0].value, 
        msg: chatForm[1].value 
    };

    socket.emit('newMessage', newMessage);
    chatForm.reset();
})

socket.on('messages', messages => {
    showMessages(messages);
})

const showMessages = messages => {
    chatCont.innerHTML = '';
    for(let m of messages){
        let msgCont = document.createElement("h3");
        msgCont.classList.add("msg__cont");
        msgCont.textContent = m.author;

        let msgDate = document.createElement("span");
        msgDate.classList.add("msg__date");
        msgDate.textContent = '[' + m.date + ']: ';
        msgCont.appendChild(msgDate);

        let msgText = document.createElement("i");
        msgText.classList.add("msg__text");
        msgText.textContent = m.msg;
        msgCont.appendChild(msgText);

        chatCont.appendChild(msgCont);
    }
}