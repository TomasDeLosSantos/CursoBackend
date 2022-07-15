const socket = io.connect();
const productForm = document.getElementById("product__form");

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
