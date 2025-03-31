const sharp = require('sharp');
const path = require('path');

// Función para recortar y redimensionar la imagen
async function processImage(inputPath, outputPath, width = 1080, height = 1080) {
    try {
        await sharp(inputPath)
            .resize(width, height, { fit: 'cover' }) // Ajustar al tamaño 1080x1080
            .toFile(outputPath); // Guardar la imagen recortada

        console.log(`Imagen recortada y guardada en: ${outputPath}`);
        return outputPath; // Retorna la ruta de la imagen procesada
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        throw new Error('No se pudo procesar la imagen.');
    }
}

module.exports = { processImage };
