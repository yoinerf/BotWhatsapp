const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configura Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir una imagen a Cloudinary
async function uploadImageToCloudinary(imagePath) {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: 'Dynamic folders', // Carpeta para organizar imágenes en Cloudinary
        });
        console.info(result.secure_url);
        return result.secure_url; // Retorna la URL pública de la imagen
    } catch (error) {
        console.error('Error al subir la imagen a Cloudinary:', error);
        throw new Error('No se pudo subir la imagen.');
    }
}

module.exports = { uploadImageToCloudinary };
