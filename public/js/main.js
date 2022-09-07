const socket = io.connect();
const productForm = document.getElementById("product__form");
const chatForm = document.getElementById("chat__form");
const chatCont = document.getElementById("chat__cont");
let logged = 0;

// BUTTONS
const loginNav = document.getElementById('login__nav');
const registerNav = document.getElementById('register__nav');
const logoutBtn = document.getElementById('logout__btn');

// LOGIN
const loginForm = document.getElementById('login__form');
const loginMsg = document.getElementById('login__msg');
const loginInput = document.getElementById('login__input');
const loginBtn = document.getElementById('login__btn');
const loginErr = document.getElementById('login__err');

// REGISTER
const registerForm = document.getElementById('register__form');
const registerErr = document.getElementById('register__err');

loginNav.addEventListener('click', e => {
    e.preventDefault();
    loginErr.style.display = 'none';
    registerForm.style.display = 'none';
    if(loginForm.style.display == 'block'){
        loginForm.style.display = 'none';
    } else {
        loginForm.style.display = 'block';
    }
    
})
registerNav.addEventListener('click', e => {
    e.preventDefault();
    registerErr.style.display = 'none';
    loginForm.style.display = 'none';
    if(registerForm.style.display == 'block'){
        registerForm.style.display = 'none';
    } else {
        registerForm.style.display = 'block';
    }
})

fetch('/logged')
    .then(res => res.json())
    .then(data => {
        if(data.username){
            loginMsg.textContent = `Welcome ${data.username}`;
            logged = data.login;
            loginBtn.style.display = 'none';
            loginInput.style.display = 'none';
            logoutBtn.style.display = 'block';
        }
    })
    .catch(err => console.error(err))

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    if(loginForm[0].value && loginForm[1].value){
        console.log(loginForm[0].value);
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: loginForm[0].value, password: loginForm[1].value})
        })
            .then(res => res.json())
            .then(data => {
                loginMsg.textContent = `Welcome ${data.username}`;
                logged = data.login;
                loginNav.style.display = 'none';
                registerNav.style.display = 'none';
                logoutBtn.style.display = 'block';
                loginForm.style.display = 'none';
                loginForm.reset();
            })
            .catch(err => {
                // console.error(err);
                loginErr.style.display = 'inline-block'
                loginErr.textContent = 'Invalid Credentials';
                loginForm.reset();
                // loginMsg.textContent = `Invalid Credentials`;
            })
    }

})

registerForm.addEventListener('submit', e => {
    e.preventDefault();

    if(registerForm[0].value && registerForm[1].value){
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: registerForm[0].value, password: registerForm[1].value})
        })  
            .then(res => res.json())
            .then(data => {
                loginMsg.textContent = 'User Registered Correctly';
                registerForm.style.display = 'none';
                registerForm.reset();
            })
            .catch(err => {
                registerErr.style.display = 'inline-block'
                registerErr.textContent = 'User Already Exists';
                registerForm.reset();
            })
    }
})

logoutBtn.addEventListener('click', e => {
    e.preventDefault();
    fetch('/logout')
        .then(res => res.json())
        .then(data => {
            loginMsg.textContent = `Bye ${data.username}`;
            logged = data.login;
            loginNav.style.display = 'inline';
            registerNav.style.display = 'inline';
            logoutBtn.style.display = 'none';

            setTimeout(() => {
                loginMsg.textContent = 'Login';
            }, 2000);
        })
        .catch(err => console.error(err))
})


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
    if (msgs) {
        let denormalizedData = normalizr.denormalize(msgs[0].result, messages, msgs[0].entities);
        showMessages(denormalizedData.messages);
    }
})

const showMessages = messages => {
    chatCont.innerHTML = '';
    for (let m of messages) {
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
