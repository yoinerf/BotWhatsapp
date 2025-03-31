const client = require('./whatsapp');
const { getDatabaseData } = require('./notion');

const { getAllProducts, addToCart, createCheckoutFromCart, createProduct, verCarrito, createEmployee } = require('./shopify');
const { uploadImageToCloudinary } = require('./uploadImage');
const fs = require('fs');
const path = require('path');
const { processImage } = require('./processImage');

global.userRegistration = {}; // Guardar temporalmente el estado de registro por usuario

global.cart = [];
global.validIds = ['ID123', 'ID456', 'ID789']; // Lista de IDs válidos

// Directorio temporal para imágenes
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR); // Crear el directorio si no existe
}

const IMAGE_DIR = path.join(__dirname, 'images');
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR); // Crear el directorio si no existe
}

const linksMap = new Map([
    ['Amparo Montoya Hernández', 'https://persistent-monkey-b22.notion.site/Huevos-Parcela-Mirador-15dd86f624a780ba92fbee694c70901f'],
    ['Cimientos del Hogar - ASMUECH', 'https://persistent-monkey-b22.notion.site/Asmuech-Arom-ticas-15ed86f624a7803fb1b1d31042842105'],
    ['Rosa Rodríguez Martínez', 'https://persistent-monkey-b22.notion.site/Chocolate-de-Cacao-Rosita-15ed86f624a7803c92bdc87e99dbc995'],
]);

global.productList = []; // Lista de productos en memoria
global.userRoles = {}; // Almacenar si un usuario es Productor o Cliente
global.userStep = '';

const encuesta = "https://forms.office.com/r/DQtYj73UYG";
const historiaDeVida = "";
client.on('message', async (message) => {

    
    const userId = message.from; // Identificar al usuario
    const text = message.body.toLowerCase();

    // Inicializa el rol del usuario si no existe
    if (!global.userRoles[userId]) {
        global.userRoles[userId] = { role: null, step: 0, productData: {} };
    }

    const userSession = global.userRoles[userId];

    // Comando para saludar
    if ((text.includes('hola') || text.includes('inici')) && global.userStep === '') {
        userSession.role = null; // Reinicia el rol al volver al menú principal
        userSession.step = 0; // Reinicia el flujo
        await message.reply('👋 Hola. Bienvenid@ a Ucua. La plataforma de interacción y comunicación al servicio del agro');
        await client.sendMessage(message.from, 'Por favor escribe si vas a iniciar como *"Productor"* o como *"Cliente"*.\n\nPara regresar al menú principal puedes escribir "Hola" o "Inicio".');
    }

    else if (text === 'registrar' && global.userStep === '') {
        global.userRegistration[userId] = { step: 1, employeeData: {} };
        await message.reply('📝 Vamos a registrar un nuevo empleado. Por favor escribe el *nombre completo* del empleado.');
        return;
    }

    else if (global.userRegistration[userId] && global.userRegistration[userId].step > 0) {
        const registration = global.userRegistration[userId];
        switch (registration.step) {
            case 1: // Captura nombre completo
                registration.employeeData.fullName = text;
                registration.step = 2;
                await message.reply('✉️ Ahora escribe el *correo electrónico* del empleado.');
                break;

            case 2: // Captura correo electrónico
                registration.employeeData.email = text;
                registration.step = 3;
                await message.reply('📞 Por favor escribe el *número de teléfono* del empleado.');
                break;

            case 3: // Captura teléfono
                registration.employeeData.phone = text;
                registration.step = 4;
                await message.reply('🆔 Ahora, escribe el *ID único* del empleado (Ejemplo: EMP001).');
                break;

            case 4: // Captura ID único
                registration.employeeData.employeeId = text;
                registration.step = 5;

                // Confirmar datos
                const { fullName, email, phone, employeeId } = registration.employeeData;
                await message.reply(
                    `✅ Por favor confirma los datos:\n\n` +
                    `*Nombre Completo:* ${fullName}\n` +
                    `*Correo Electrónico:* ${email}\n` +
                    `*Teléfono:* ${phone}\n` +
                    `*ID:* ${employeeId}\n\n` +
                    `Escribe "confirmar" para registrar o "cancelar" para anular.`
                );
                break;

            case 5: // Confirmación final
                if (text === 'confirmar') {
                    try {
                        const [firstName, ...lastNameParts] = registration.employeeData.fullName.split(' ');
                        const lastName = lastNameParts.join(' ');

                        const employee = await createEmployee({
                            firstName,
                            lastName,
                            email: registration.employeeData.email,
                            phone: registration.employeeData.phone,
                            employeeId: registration.employeeData.employeeId,
                        });

                        await message.reply(`🎉 Empleado registrado exitosamente:\n\n` +
                            `*ID Shopify:* ${employee.id}\n` +
                            `*Nombre Completo:* ${employee.first_name} ${employee.last_name}\n` +
                            `*Correo Electrónico:* ${employee.email}\n`);

                        // Reiniciar flujo
                        global.userRegistration[userId] = null;
                    } catch (error) {
                        console.error('Error al registrar el empleado:', error.message);
                        await message.reply('❌ Hubo un error al registrar el empleado. Intenta nuevamente.');
                    }
                } else if (text === 'cancelar') {
                    await message.reply('❌ Registro cancelado. Escribe "registrar" para iniciar nuevamente.');
                    global.userRegistration[userId] = null;
                } else {
                    await message.reply('Por favor escribe "confirmar" o "cancelar".');
                }
                break;
        }
        return;
    }
    else if (text.includes('productor') && global.userStep === '') {
        userSession.role = 'productor';
        userSession.step = 0;
        await message.reply('*¿Ya diligenciaste la encuesta de caracterización?* \nSi no, te invitamos a que nos cuentes de ti en el siguiente enlace: 🔗' + encuesta);
        await message.reply('Si ya manejas la plataforma y deseas crear un producto en la tienda virtua, escribe *"Crear"*.');

    }
    else if (text.includes('cliente') && global.userStep === '') {
        userSession.role = 'cliente';
        await message.reply('🤗 Perfecto. \nPor favor escribe *"Catálogo"* para visualizar los productos disponibles.\n\nÓ escribe *"Hoja"* Para visualizar las hojas de vida de los Productores');
    }

    else if (text === 'hoja' && global.userStep === '' && userSession.role === 'cliente') {
        // Lista los nombres disponibles en el Map
        let response = '📋 *Lista de nombres encontrados:*\n';
        Array.from(linksMap.keys()).forEach((name, index) => {
            response += `${index + 1}. ${name}\n`;
        });
        response += '\n✍️ Escribe el nombre o parte del nombre para obtener el enlace correspondiente.';
        await client.sendMessage(message.from, response);

        // Cambiar el paso del usuario
        global.userStep = 'buscando_hoja';
    }

    else if (global.userStep === 'buscando_hoja' && userSession.role === 'cliente') {
        // Buscar coincidencias parciales en el Map
        await client.sendMessage(message.from, '⌛ Ya te pasamos el enlace...');

        const normalizedText = normalizeText(text);
        const results = Array.from(linksMap.entries()).filter(([name]) =>
            normalizeText(name).includes(normalizedText)
        );

        if (results.length > 0) {
            let response = '🔍 *Resultados de la búsqueda:*\n';
            results.forEach(([name, link], index) => {
                response += `${index + 1}. *${name}*\n🔗 ${link}\n`;
            });
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.from, '_Para ver nuevamente el listado escribe *"Hoja"* o escribe *"Catálogo"* para ver los productos_');

        } else {
            await client.sendMessage(message.from, `❌ No se encontraron coincidencias para "${text}". Intenta con otro término por favor.`);
            return;
        }

        // Reiniciar el flujo
        global.userStep = '';
    }


    else if ((text.includes('catalogo') || text.includes('catálogo')) && global.userStep === '' && userSession.role === 'cliente') {
        try {
            const products = await getAllProducts();

            if (products.length > 0) {
                let response = '🤗 Es un gusto tenerte aquí, te presentamos la lista de productos disponibles 📋:\n';
                products.forEach((product, index) => {
                    //response += `${index + 1}. ${product.title} - $${product.price}\n`;
                    response += `${index + 1}. ${product.title} - $${parseInt(product.variants?.[0]?.price, 10)}\n`;

                });
                response += '\nDigita el número del producto que deseas seleccionar para continuar.';
                await message.reply(response);

                global.productList = products; // Guarda los productos en memoria
            } else {
                await message.reply('No se encontraron productos.');
            }
        } catch (error) {
            await message.reply('❌ Hubo un error al obtener la lista de productos. Inténtalo más tarde.');
        }
    }

    else if (text === 'salir') {
        // Reiniciar flujo
        global.userStep = '';
        if (userSession.step != 0) {
            userSession.productData = {};
        }
        userSession.role = '';
        userSession.step = 0;
        await message.reply('👋 Se finalizó correctamente. \nPara iniciar nuevamente escriba *"Hola"* o *"Inicio"*.');
    }

    else if (text === 'cancelar') {
        // cancelar flujo
        global.userStep = '';
        if (userSession.step != 0) {
            userSession.productData = {};
        }
        userSession.role = '';
        userSession.step = 0;
        await message.reply('👋 Se canceló correctamente. \nPara iniciar nuevamente el menú, escriba *"Hola"* o *"Inicio"*.');
    }


    // Flujo de creación de productos para productores
    else if (userSession.role === 'productor') {
        switch (userSession.step) {
            case 0: // Solicitar ID válido
                if (text === 'crear') {
                    userSession.step = 1;
                    global.userStep = 'Creando_Producto';
                    await message.reply('🔑 Por favor ingresa tu ID de productor para continuar.');
                }
                break;

            case 1: // Validar el ID proporcionado
                if (global.validIds.includes(text.toUpperCase())) {
                    userSession.productData.producerId = text.toUpperCase();
                    userSession.step = 2;
                    await client.sendMessage(message.from, '✅ ID validado correctamente. \nAhora, por favor escribe el título del producto.');
                } else {
                    await client.sendMessage(message.from, '❌ ID no válido. Por favor verifica e intenta nuevamente.');
                }
                break;

            case 2: // Capturar título
                userSession.productData.category = "Sin Categoria";
                userSession.productData.title = text;
                userSession.step = 3;
                await message.reply('📝 Por favor, escribe una descripción para el producto.');
                break;

            case 3: // Capturar descripción
                userSession.productData.description = text;
                userSession.step = 4;
                await message.reply('💲¿Cuál es el precio del producto? sin puntos ni comas (Ejemplo: 10000)');
                break;

            case 4: // Capturar precio
                const price = parseFloat(text);
                if (isNaN(price) || price <= 0) {
                    await message.reply('El precio debe ser un número mayor a 0. Por favor, intenta de nuevo.');
                } else {
                    userSession.productData.price = price;
                    userSession.step = 5;
                    await message.reply('📦Ingrese la cantidad disponible en inventario.');
                }
                break;

            case 5: // Capturar cantidad disponible
                const quantity = parseInt(text, 10);
                if (isNaN(quantity) || quantity < 0) {
                    await message.reply('La cantidad debe ser un número entero mayor o igual a 0. Por favor, intenta de nuevo.');
                } else {
                    userSession.productData.quantity = quantity;
                    userSession.step = 6;
                    await message.reply('📷 Por último, envíanos una imagen del producto.');
                }
                break;

            case 6: // Capturar imagen y crear producto
                if (message.hasMedia) {
                    const media = await message.downloadMedia();
                    const inputPath = path.join(TEMP_DIR, `${userId}-${Date.now()}-input.jpg`);
                    const outputPath = path.join(TEMP_DIR, `${userId}-${Date.now()}-output.jpg`);

                    // Guardar la imagen original
                    fs.writeFileSync(inputPath, media.data, { encoding: 'base64' });
                    console.log(`Imagen original guardada en: ${inputPath}`);

                    try {
                        // Procesar la imagen a 1080x1080
                        await processImage(inputPath, outputPath);

                        // Subir la imagen procesada a Cloudinary
                        const imageUrl = await uploadImageToCloudinary(outputPath);
                        console.log(`URL de la imagen recortada: ${imageUrl}`);
                        userSession.productData.imageUrl = imageUrl;

                        await client.sendMessage(message.from, 'Estamos creando el producto. Por favor espera...');

                        // Crear producto en Shopify
                        const product = await createProduct(userSession.productData);
                        await message.reply(`🚀 Producto creado exitosamente:\n\nID: ${product.id}\nTítulo: ${product.title}\n \n Puedes crear otro producto con el comando "Crear" o terminar escribiendo "Salir"`);

                        // Eliminar imágenes temporales
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);

                        // Reiniciar flujo
                        userSession.step = 0;
                        userSession.productData = {};
                        global.userStep = '';
                    } catch (error) {
                        console.error('Error durante el proceso:', error);
                        await message.reply('❌ Se presentó un problema al crear el producto. Intenta nuevamente.');
                    }
                } else {
                    await message.reply('Por favor, envía una imagen válida del producto.');
                }
                break;

            default:
                await message.reply('Escribe "crear" para iniciar el proceso de creación.');
                userSession.step = 0;
                userSession.productData = {};
                break;
        }
    }

    // Comando para generar enlace de compra (solo para clientes)
    else if (userSession.role === 'cliente' && text.includes('compra') && global.userStep === '') {
        try {
            await client.sendMessage(message.from, "⌛ Ya te pasamos el enlace...");

            const checkoutLink = await createCheckoutFromCart();
            await message.reply(`🎉 Aquí está tu enlace para completar la compra:\n🛒${checkoutLink}. \n \nGracias por visitarnos. \nHasta pronto 😊`);

            global.userStep = '';
            userSession.productData = {};
            userSession.role = '';
            userSession.step = 0;

            await client.sendMessage(message.from, 'Bienvenido nuevamente al inicio.\nPor favor escribe si eres *"Productor"* o *"Cliente"*.\n \nPara regresar al menú principal siempre puedes escribir *"Hola"* o *"Inicio"*.');
        } catch (error) {
            await message.reply('❌ No se pudo generar el enlace de compra. Verifica si el carrito está vacío.');
        }
    }

    // Comando para ingresar la cantidad del producto seleccionado
    else if (/^\d+$/.test(text) && global.selectedProduct && userSession.role === 'cliente' && global.userStep === 'Comprando') {
        const quantity = parseInt(text, 10);

        if (quantity > 0) {
            try {
                const selectedProduct = global.selectedProduct;
                const price = parseInt(selectedProduct.variants?.[0]?.price, 10);
                //const price = parseInt(selectedProduct.variants?.[0]?.price || '0', 10) / 100;
                addToCart(selectedProduct.variants[0]?.id, quantity, selectedProduct.title, price);

                await message.reply(`✅ Añadiste ${quantity} unidad(es) de "${selectedProduct.title}" al carrito.
                    \n\n🛒 Escribe *"carrito"* para ver los productos que se han agregado.
                    \n📦 Escribe *"catálogo"* para ver todos los productos disponibles.
                    \n💳 Escribe *"comprar"* para cerrar tu carrito y recibir el enlace de pago*.
                    \n \n_Al escribir "Comprar", los productos agregados se eliminarán de la lista y se enviarán al carrito del comercio._`);
                global.selectedProduct = null; // Resetea la selección
                global.userStep = '';
            } catch (error) {
                console.error('Error al agregar producto al carrito:', error);
                await message.reply('❌ Se presentó un problema al añadir el producto al carrito. Inténtalo más tarde.');
            }
        } else {
            await message.reply('La cantidad debe ser mayor a 0. Por favor, intenta de nuevo.');
        }
    }

    // Comando para seleccionar un producto
    else if (/^\d+$/.test(text) && userSession.role === 'cliente' && global.userStep === '') {
        const productIndex = parseInt(text, 10) - 1;

        if (global.productList && global.productList[productIndex]) {
            global.selectedProduct = global.productList[productIndex];
            await message.reply(`Seleccionaste "${global.selectedProduct.title}".\n📦 Por favor ingresa la cantidad que deseas agregar.`);
            global.userStep = 'Comprando';
        } else {
            await message.reply('El número seleccionado no es válido. Usa *"Productos"* para ver la lista de nuevo.');
        }
    }

    else if (text.includes('carr') && userSession.role === 'cliente' && global.userStep === '') {

        const articulos = await verCarrito();
        let response = '🛒 *Productos en tu carrito:*\n ' + articulos;
        console.log(articulos);

        response += '\n \n💳 Escribe "Comprar" para completar tu compra.';
        await message.reply(response);

    }

    else if (global.userStep === 'Comprando') {
        await message.reply('🚨 Tienes un proceso de compra pendiente. \nDinos la cantidad para continuar o escribe *"Salir"* si quieres cancelarlo.');
    }

    else if (global.userStep === 'Creando_Producto') {
        await message.reply('🚨 Tienes un proceso de creación pendiente. \nEscribe *"Salir"* si quieres cancelarlo.');
    }

    else {
        // Manejo de opción no válida
        await message.reply('❌ Opción no válida. Por favor, escribe *"Hola"* o *"Inicio"* para ver el menú principal.');
    }
});

function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}


function reset() {

}
