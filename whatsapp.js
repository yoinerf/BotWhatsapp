const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Importante para Render y servidores en la nube
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--disable-infobars',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-dev-shm-usage',
            '--disable-features=Translate',
            '--mute-audio'
        ],
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
    console.log('⚠ Cliente desconectado:', reason);
    client.initialize(); // Reintenta inicializar el cliente
});

client.initialize();

module.exports = client;
