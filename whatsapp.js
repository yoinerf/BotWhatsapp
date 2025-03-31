const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,  // Render no tiene entorno gráfico
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-software-rasterizer'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('Escanea el QR desde este enlace:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
});

//client.on('qr', (qr) => {
//    console.log('Escanea este código QR para iniciar sesión:');
//    qrcode.generate(qr, { small: true });
//});

client.on('ready', () => {
    console.log('✅ El cliente de WhatsApp está listo.');
});

client.on('auth_failure', (message) => {
    console.error('❌ Error de autenticación:', message);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    setTimeout(() => {
        console.log('♻ Reconectando el bot...');
        client.initialize();
    }, 5000);
});

client.initialize();

module.exports = client;
