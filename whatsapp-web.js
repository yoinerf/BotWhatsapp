const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    console.log('QR Code:', qr);
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

client.initialize();

module.exports = client;
