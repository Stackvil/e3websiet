const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
    },
    apis: [path.join(__dirname, 'routes/*.js')], // Parse all routes
};

try {
    console.log("Starting Swagger JSDoc parsing...");
    const swaggerSpec = swaggerJsdoc(options);
    console.log("Swagger JSDoc parsing successful.");
} catch (error) {
    console.error("Swagger JSDoc parsing failed:");
    console.error(error);
}
