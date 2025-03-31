const { Client } = require('@notionhq/client');
require('dotenv').config();

// Inicializa el cliente de Notion
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const notionDatabaseId = process.env.NOTION_DATABASE_ID; // ID de tu base de datos en Notion

// Función para obtener información de una base de datos
async function getDatabaseData() {
    try {
        const response = await notion.databases.query({
            database_id: notionDatabaseId,
        });
        return response.results.map((page) => {
            const title = page.properties.Name?.title[0]?.text?.content || 'Sin título';
            const description = page.properties.Description?.rich_text[0]?.text?.content || 'Sin descripción';
            return { title, description };
        });
    } catch (error) {
        console.error('Error al obtener datos de Notion:', error.message);
        throw new Error('No se pudieron obtener los datos de Notion.');
    }
}

module.exports = { getDatabaseData };
