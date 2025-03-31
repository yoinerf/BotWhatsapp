const axios = require('axios');
require('dotenv').config();


const shopifyAxios = axios.create({
    baseURL: `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/`,
    headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD,
        'Content-Type': 'application/json',
    },
});

async function getAllProducts() {
    try {
        const response = await shopifyAxios.get('products.json');
        //console.info(response.data.products);
        return response.data.products; // Retorna todos los productos
    } catch (error) {
        console.error('Error fetching products:', error.response?.data || error.message);
        throw new Error('No se pudieron obtener los productos.');
    }
}

let cart = []; // Carrito en memoria para esta sesión

// Agregar productos al carrito
//function addToCart(productVariantId, quantity) {
//    cart.push({ variant_id: productVariantId, quantity });
//}


// Generar enlace de checkout
async function createCheckoutFromCart() {
    if (cart.length === 0) {
        await message.reply('El carrito está vacío. agrega productos para continuar.');
        return;
    }
    console.info("se va a generar el enlace");

    // Generar enlace de carrito
    const cartLink = cart.map(item => `${item.variant_id}:${item.quantity}`).join(',');
    console.info(cartLink);

    const checkoutLink = `https://${process.env.SHOPIFY_STORE}/cart/${cartLink}`;

    console.info(checkoutLink);
    cart = [];
    return checkoutLink; // URL del checkout

}

async function createProduct({ title, description, price, imageUrl, category, quantity}) {
    try {
        const response = await shopifyAxios.post('products.json', {
            product: {
                title: title,
                body_html: description,
                vendor: category, // Categoría o proveedor
                variants: [
                    {
                        price: price, // Precio del producto
                        inventory_quantity: quantity, // Cantidad disponible
                        inventory_management: 'shopify', // Gestionar inventario en Shopify
                    },
                ],
                images: [
                    {
                        src: imageUrl, // URL pública de la imagen
                    },
                ],
            },
        });

        return response.data.product;
    } catch (error) {
        console.error('Error al crear el producto:', error.response?.data || error.message);
        throw new Error('No se pudo crear el producto. Verifica los datos ingresados.');
    }
}

async function verCarrito(){
        if (cart.length === 0) {
            await message.reply('El carrito está vacío. agrega productos para continuar.');
            return;
        }
        let response = '';
        cart.forEach((item, index) => {
            response += `${index + 1}. ${item.title} - ${item.quantity} unidad(es) - Subtotal*: $${item.preciofinal}\n`;
        });
        response += '\n_El precio puede variar a la hora de pagar debido a los impuestos aplicados._';
    return response;
}

function addToCart(productVariantId, quantity, title, price) {
    // Agregar producto al carrito con sus detalles
    const existingItem = cart.find((item) => item.variant_id === productVariantId);
    const preciofinal = price * quantity;

    if (existingItem) {
        existingItem.quantity += quantity;      // Incrementar cantidad si ya existe
        existingItem.preciofinal += preciofinal;            // Incrementar precio si ya existe
        console.log("se incremento producto" + price + preciofinal);

    } else {
        cart.push({ variant_id: productVariantId, quantity, title, preciofinal });
        console.log("se agrego producto con" + price + preciofinal);

    }
}

async function createEmployee(employeeData) {
    try {
        const payload = {
            customer: {
                first_name: employeeData.firstName,
                last_name: employeeData.lastName,
                email: employeeData.email,
                phone: employeeData.phone,
                tags: `producer,${employeeData.employeeId}`, // Agregar etiquetas separadas por comas
            },
        };

        const response = await shopifyAxios.post('customers.json', payload);
        console.log('Empleado creado en Shopify:', response.data.customer); // Log para verificar datos
        return response.data.customer; // Retorna el cliente creado
    } catch (error) {
        console.error('Error creando el empleado en Shopify:', error.response?.data || error.message);
        throw new Error('No se pudo crear el empleado.');
    }
}


// Validar empleado en Shopify
async function validateEmployeeInShopify(employeeId) {
    try {
        const response = await shopifyAxios.get('customers.json', {
            params: { query: `tag:${employeeId}` },
        });

        const employees = response.data.customers || [];
        return employees.find((employee) => employee.tags.includes(employeeId));
    } catch (error) {
        console.error('Error validando al empleado en Shopify:', error.response?.data || error.message);
        throw new Error('Error al validar el empleado en Shopify.');
    }
}



module.exports = { getAllProducts, addToCart, createCheckoutFromCart, createProduct, addToCart, verCarrito, createEmployee, validateEmployeeInShopify};

