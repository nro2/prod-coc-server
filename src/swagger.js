const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'coc-server',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/committee.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
