const client = require('./whatsapp');
const { getDatabaseData } = require('./notion');
const { getAllProducts, addToCart, createCheckoutFromCart, createProduct, verCarrito, createEmployee } = require('./shopify');
const { uploadImageToCloudinary } = require('./uploadImage');
const fs = require('fs');
const path = require('path');
const { processImage } = require('./processImage');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot de WhatsApp activo 🚀');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configuración de sesiones
const SESSION_EXPIRATION_TIME = 20 * 60 * 1000; // 20 minutos en milisegundos
const sessions = {};

// Limpieza periódica de sesiones con notificación
setInterval(async () => {
    const now = Date.now();
    for (const [userId, session] of Object.entries(sessions)) {
        if (now - session.lastActivity > SESSION_EXPIRATION_TIME) {
            try {
                // Notificar al usuario antes de eliminar la sesión
                await client.sendMessage(
                    userId, 
                    '⏳ *Tu sesión ha expirado por inactividad*.\n\n' +
                    'Si deseas continuar, por favor envía un nuevo mensaje para iniciar una nueva sesión.'
                );
            } catch (error) {
                console.error(`Error al notificar expiración a ${userId}:`, error);
            } finally {
                delete sessions[userId];
                console.log(`Sesión expirada eliminada: ${userId}`);
            }
        }
    }
}, 5 * 60 * 1000); // Revisar cada 5 minutos

// Directorios temporales
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

const IMAGE_DIR = path.join(__dirname, 'images');
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR);

// Datos constantes
const validIds = ['ID123', 'ID456', 'ID789'];
const encuesta = "https://forms.office.com/r/DQtYj73UYG";
const linksMap = new Map([
    ['Amparo Montoya Hernández', 'https://persistent-monkey-b22.notion.site/Huevos-Parcela-Mirador-15dd86f624a780ba92fbee694c70901f'],
    ['Cimientos del Hogar - ASMUECH', 'https://persistent-monkey-b22.notion.site/Asmuech-Arom-ticas-15ed86f624a7803fb1b1d31042842105'],
    ['Rosa Rodríguez Martínez', 'https://persistent-monkey-b22.notion.site/Chocolate-de-Cacao-Rosita-15ed86f624a7803c92bdc87e99dbc995'],
]);

client.on('message', async (message) => {
    const userId = message.from;
    const text = message.body.toLowerCase();

    // Inicializar o actualizar sesión
    if (!sessions[userId]) {
        sessions[userId] = {
            role: null,
            step: 0,
            productData: {},
            registrationData: {},
            cart: [],
            selectedProduct: null,
            productList: [],
            lastActivity: Date.now(),
            currentFlow: '',
            tempData: {}
        };
    }
    const userSession = sessions[userId];
    userSession.lastActivity = Date.now();

    // Comandos generales
    if (text === 'salir') {
        resetUserSession(userSession);
        await message.reply('👋 Se finalizó correctamente. \nPara iniciar nuevamente escriba *"Hola"* o *"Inicio"*.');
        return;
    }

    if (text === 'cancelar') {
        resetUserSession(userSession);
        await message.reply('👋 Se canceló correctamente. \nPara iniciar nuevamente el menú, escriba *"Hola"* o *"Inicio"*.');
        return;
    }

    if (text.includes('hola') || text.includes('inici')) {
        resetUserSession(userSession);
        await message.reply('👋 Hola. Bienvenid@ a Ucua. La plataforma de interacción y comunicación al servicio del agro');
        await client.sendMessage(userId, 'Por favor escribe si vas a iniciar como *"Productor"* o como *"Cliente"*.');
        return;
    }

    // Flujo de registro de empleados
    if (text === 'registrar' && userSession.currentFlow === '') {
        userSession.registrationData = { step: 1, employeeData: {} };
        userSession.currentFlow = 'registro_empleado';
        await message.reply('📝 Vamos a registrar un nuevo empleado. Por favor escribe el *nombre completo* del empleado.');
        return;
    }

    if (userSession.currentFlow === 'registro_empleado') {
        await handleEmployeeRegistration(message, userSession);
        return;
    }

    // Selección de rol (Productor/Cliente)
    if (text.includes('productor') && userSession.currentFlow === '') {
        userSession.role = 'productor';
        userSession.step = 0;
        await message.reply('*¿Ya diligenciaste la encuesta de caracterización?* \nSi no, te invitamos a que nos cuentes de ti en el siguiente enlace: 🔗' + encuesta);
        await message.reply('Si ya manejas la plataforma y deseas crear un producto en la tienda virtua, escribe *"Crear"*.');
        return;
    }

    if (text.includes('cliente') && userSession.currentFlow === '') {
        userSession.role = 'cliente';
        await message.reply('🤗 Perfecto. \nEscribe *"Catálogo"* para visualizar los productos disponibles.\n\nÓ escribe *"Hoja"* Para visualizar las hojas de vida de los Productores');
        return;
    }

    // Flujo para clientes
    if (userSession.role === 'cliente') {
        await handleClientFlow(message, userSession);
        return;
    }

    // Flujo para productores
    if (userSession.role === 'productor') {
        await handleProducerFlow(message, userSession);
        return;
    }

    // Mensaje por defecto
    await message.reply('❌ Opción no válida. Por favor, escribe *"Hola"* o *"Inicio"* para ver el menú principal.');
});

// ================= FUNCIONES AUXILIARES =================

function resetUserSession(session) {
    session.role = null;
    session.step = 0;
    session.productData = {};
    session.registrationData = {};
    session.cart = [];
    session.selectedProduct = null;
    session.currentFlow = '';
    session.tempData = {};
}

async function handleEmployeeRegistration(message, userSession) {
    const userId = message.from;
    const text = message.body;
    const registration = userSession.registrationData;

    switch (registration.step) {
        case 1:
            registration.employeeData.fullName = text;
            registration.step = 2;
            await message.reply('✉️ Ahora escribe el *correo electrónico* del empleado.');
            break;

        case 2:
            registration.employeeData.email = text;
            registration.step = 3;
            await message.reply('📞 Por favor escribe el *número de teléfono* del empleado.');
            break;

        case 3:
            registration.employeeData.phone = text;
            registration.step = 4;
            await message.reply('🆔 Ahora, escribe el *ID único* del empleado (Ejemplo: EMP001).');
            break;

        case 4:
            registration.employeeData.employeeId = text;
            registration.step = 5;
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

        case 5:
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

                    resetUserSession(userSession);
                } catch (error) {
                    console.error('Error al registrar el empleado:', error.message);
                    await message.reply('❌ Hubo un error al registrar el empleado. Intenta nuevamente.');
                }
            } else if (text === 'cancelar') {
                await message.reply('❌ Registro cancelado. Escribe "registrar" para iniciar nuevamente.');
                resetUserSession(userSession);
            } else {
                await message.reply('Por favor escribe "confirmar" o "cancelar".');
            }
            break;
    }
}

async function handleClientFlow(message, userSession) {
    const userId = message.from;
    const text = message.body.toLowerCase();

    // Mostrar hojas de vida
    if (text === 'hoja' && userSession.currentFlow === '') {
        let response = '📋 *Lista de nombres encontrados:*\n';
        Array.from(linksMap.keys()).forEach((name, index) => {
            response += `${index + 1}. ${name}\n`;
        });
        response += '\n✍️ Escribe el nombre o parte del nombre para obtener el enlace correspondiente.';
        await client.sendMessage(userId, response);
        userSession.currentFlow = 'busqueda_hoja';
        return;
    }

    // Buscar hojas de vida
    if (userSession.currentFlow === 'busqueda_hoja') {
        await client.sendMessage(userId, '⌛ Ya te pasamos el enlace...');
        const normalizedText = normalizeText(text);
        const results = Array.from(linksMap.entries()).filter(([name]) =>
            normalizeText(name).includes(normalizedText)
        );

        if (results.length > 0) {
            let response = '🔍 *Resultados de la búsqueda:*\n';
            results.forEach(([name, link], index) => {
                response += `${index + 1}. *${name}*\n🔗 ${link}\n`;
            });
            await client.sendMessage(userId, response);
            await client.sendMessage(userId, '_Para ver nuevamente el listado escribe *"Hoja"* o escribe *"Catálogo"* para ver los productos_');
        } else {
            await client.sendMessage(userId, `❌ No se encontraron coincidencias para "${text}". Intenta con otro término por favor.`);
        }
        userSession.currentFlow = '';
        return;
    }

    // Mostrar catálogo
    if ((text.includes('catalogo') || text.includes('catálogo')) && userSession.currentFlow === '') {
        try {
            const products = await getAllProducts();
            userSession.productList = products;

            if (products.length > 0) {
                let response = '🤗 Es un gusto tenerte aquí, te presentamos la lista de productos disponibles 📋:\n';
                products.forEach((product, index) => {
                    response += `${index + 1}. ${product.title} - $${parseInt(product.variants?.[0]?.price, 10)}\n`;
                });
                response += '\nDigita el número del producto que deseas seleccionar para continuar.';
                await message.reply(response);
            } else {
                await message.reply('No se encontraron productos.');
            }
        } catch (error) {
            await message.reply('❌ Hubo un error al obtener la lista de productos. Inténtalo más tarde.');
        }
        return;
    }

    // Seleccionar producto del catálogo
    if (/^\d+$/.test(text) && userSession.currentFlow === '' && userSession.productList) {
        const productIndex = parseInt(text, 10) - 1;
        if (userSession.productList[productIndex]) {
            userSession.selectedProduct = userSession.productList[productIndex];
            await message.reply(`Seleccionaste "${userSession.selectedProduct.title}".\n📦 Por favor ingresa la cantidad que deseas agregar.`);
            userSession.currentFlow = 'agregando_producto';
        } else {
            await message.reply('El número seleccionado no es válido. Usa *"Catálogo"* para ver la lista de nuevo.');
        }
        return;
    }

    // Agregar cantidad de producto seleccionado
    if (userSession.currentFlow === 'agregando_producto' && userSession.selectedProduct) {
        const quantity = parseInt(text, 10);
        if (isNaN(quantity)) {
            await message.reply('Por favor ingresa un número válido.');
            return;
        }

        if (quantity > 0) {
            try {
                const selectedProduct = userSession.selectedProduct;
                const price = parseInt(selectedProduct.variants?.[0]?.price, 10);
                addToCart(selectedProduct.variants[0]?.id, quantity, selectedProduct.title, price);

                await message.reply(`✅ Añadiste ${quantity} unidad(es) de "${selectedProduct.title}" al carrito.
                    \n\n🛒 Escribe *"carrito"* para ver los productos agregados.
                    \n📦 Escribe *"catálogo"* para ver más productos.
                    \n💳 Escribe *"comprar"* para finalizar tu compra.`);

                userSession.selectedProduct = null;
                userSession.currentFlow = '';
            } catch (error) {
                console.error('Error al agregar producto al carrito:', error);
                await message.reply('❌ Se presentó un problema al añadir el producto al carrito. Inténtalo más tarde.');
            }
        } else {
            await message.reply('La cantidad debe ser mayor a 0. Por favor, intenta de nuevo.');
        }
        return;
    }

    // Ver carrito
    if (text.includes('carr') && userSession.currentFlow === '') {
        const articulos = await verCarrito();
        let response = '🛒 *Productos en tu carrito:*\n' + articulos;
        response += '\n\n💳 Escribe *"comprar"* para finalizar tu compra.';
        await message.reply(response);
        return;
    }

    // Finalizar compra
    if (text.includes('comprar') && userSession.currentFlow === '') {
        try {
            await client.sendMessage(userId, "⌛ Ya te pasamos el enlace...");
            const checkoutLink = await createCheckoutFromCart();
            await message.reply(`🎉 Aquí está tu enlace para completar la compra:\n🛒${checkoutLink}\n\nGracias por visitarnos. ¡Hasta pronto! 😊`);
            resetUserSession(userSession);
        } catch (error) {
            await message.reply('❌ No se pudo generar el enlace de compra. Verifica si el carrito está vacío.');
        }
        return;
    }

    // Manejo de flujos pendientes
    if (userSession.currentFlow !== '') {
        await message.reply('🚨 Tienes un proceso pendiente. Por favor completa el paso actual o escribe *"Cancelar"* para salir.');
        return;
    }
}

async function handleProducerFlow(message, userSession) {
    const userId = message.from;
    const text = message.body.toLowerCase();

    // Iniciar creación de producto
    if (text === 'crear' && userSession.currentFlow === '') {
        userSession.currentFlow = 'creacion_producto';
        userSession.step = 1;
        await message.reply('🔑 Por favor ingresa tu ID de productor para continuar.');
        return;
    }

    // Flujo de creación de producto
    if (userSession.currentFlow === 'creacion_producto') {
        switch (userSession.step) {
            case 1: // Validar ID
                if (validIds.includes(text.toUpperCase())) {
                    userSession.productData.producerId = text.toUpperCase();
                    userSession.step = 2;
                    await message.reply('✅ ID validado correctamente. \nAhora, por favor escribe el título del producto.');
                } else {
                    await message.reply('❌ ID no válido. Por favor verifica e intenta nuevamente.');
                }
                break;

            case 2: // Título del producto
                userSession.productData.title = text;
                userSession.productData.category = "Sin Categoria";
                userSession.step = 3;
                await message.reply('📝 Por favor, escribe una descripción para el producto.');
                break;

            case 3: // Descripción
                userSession.productData.description = text;
                userSession.step = 4;
                await message.reply('💲 ¿Cuál es el precio del producto? (Ejemplo: 10000)');
                break;

            case 4: // Precio
                const price = parseFloat(text);
                if (isNaN(price) || price <= 0) {
                    await message.reply('El precio debe ser un número mayor a 0. Intenta de nuevo.');
                } else {
                    userSession.productData.price = price;
                    userSession.step = 5;
                    await message.reply('📦 Ingrese la cantidad disponible en inventario.');
                }
                break;

            case 5: // Cantidad
                const quantity = parseInt(text, 10);
                if (isNaN(quantity) || quantity < 0) {
                    await message.reply('La cantidad debe ser un número entero ≥ 0. Intenta de nuevo.');
                } else {
                    userSession.productData.quantity = quantity;
                    userSession.step = 6;
                    await message.reply('📷 Por último, envía una imagen del producto.');
                }
                break;

            case 6: // Imagen
                if (message.hasMedia) {
                    try {
                        const media = await message.downloadMedia();
                        const inputPath = path.join(TEMP_DIR, `${userId}-${Date.now()}-input.jpg`);
                        const outputPath = path.join(TEMP_DIR, `${userId}-${Date.now()}-output.jpg`);

                        fs.writeFileSync(inputPath, media.data, { encoding: 'base64' });
                        await processImage(inputPath, outputPath);
                        userSession.productData.imageUrl = await uploadImageToCloudinary(outputPath);

                        await message.reply('⏳ Creando producto, por favor espera...');
                        const product = await createProduct(userSession.productData);

                        await message.reply(`✅ Producto creado exitosamente:\n\n` +
                            `*ID:* ${product.id}\n` +
                            `*Título:* ${product.title}\n` +
                            `*Precio:* $${userSession.productData.price}\n\n` +
                            `Puedes crear otro producto con *"Crear"* o *"Salir"* para terminar.`);

                        // Limpiar archivos temporales
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);

                        // Reiniciar flujo
                        userSession.productData = {};
                        userSession.step = 0;
                        userSession.currentFlow = '';
                    } catch (error) {
                        console.error('Error al crear producto:', error);
                        await message.reply('❌ Error al crear el producto. Intenta nuevamente.');
                    }
                } else {
                    await message.reply('Por favor envía una imagen válida del producto.');
                }
                break;
        }
        return;
    }

    // Manejo de flujos pendientes
    if (userSession.currentFlow !== '') {
        await message.reply('🚨 Tienes un proceso pendiente. Por favor completa el paso actual o escribe *"Cancelar"* para salir.');
    }
}

function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}