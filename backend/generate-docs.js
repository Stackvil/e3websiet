const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ethree API',
            version: '1.0.0',
            description: 'API for Ethree - Eat, Enjoy, Entertainment platform (Supabase PostgreSQL Version)',
        },
        servers: [
            {
                url: 'https://e3-e4-backend.vercel.app',
                description: 'Production Server'
            },
            {
                url: `http://localhost:${PORT}`,
                description: 'Local Server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [path.join(__dirname, 'routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

fs.writeFileSync(
    path.join(__dirname, 'swagger.json'),
    JSON.stringify(swaggerSpec, null, 2),
    'utf-8'
);

console.log('Swagger documentation generated at backend/swagger.json');
