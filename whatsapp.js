const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client({
    puppeteer: {
        headless: false, // Mostrar el navegador
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('Escanea este código QR para iniciar sesión:');
    require('qrcode-terminal').generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('El cliente está listo para usar.');
});

client.on('auth_failure', (message) => {
    console.error('Error de autenticación:', message);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    client.initialize(); // Reintenta inicializar el cliente
});

client.initialize();

module.exports = client;
